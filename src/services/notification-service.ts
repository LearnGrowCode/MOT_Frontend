import { BookEntry } from "@/db/models/Book";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function registerForPushNotificationsAsync() {
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== "granted") {
      console.log("Failed to get push token for push notification!");
      return false;
    }
    return true;
  } else {
    console.log("Must use physical device for Push Notifications");
    return false;
  }
}

export async function schedulePaymentReminder(entry: BookEntry) {
  // If notifications are disabled for this entry, cancel existing and return
  if (entry.notificationsEnabled === false) {
    if (entry.notificationId) {
      try {
        await cancelNotification(entry.notificationId);
      } catch {
        // ignore
      }
    }
    return;
  }

  const hasPermission = await registerForPushNotificationsAsync();
  if (!hasPermission) return;

  // Cancel any existing notification for this entry if we have its ID
  if (entry.notificationId) {
    try {
      await cancelNotification(entry.notificationId);
    } catch {
      console.log("Could not cancel previous notification, it may have already fired or been removed.");
    }
  }

  // Use due date if available, otherwise fallback to entry date
  const targetDate = entry.dueDate || entry.date;
  let reminderDate = new Date(targetDate);

  // Apply reminder interval logic
  switch (entry.reminderInterval) {
    case "1_day_before":
      reminderDate = new Date(targetDate - 24 * 60 * 60 * 1000);
      break;
    case "2_days_before":
      reminderDate = new Date(targetDate - 2 * 24 * 60 * 60 * 1000);
      break;
    case "3_days_before":
      reminderDate = new Date(targetDate - 3 * 24 * 60 * 60 * 1000);
      break;
    case "weekly":
      // Remind 7 days before
      reminderDate = new Date(targetDate - 7 * 24 * 60 * 60 * 1000);
      break;
    case "monthly":
      // Remind 30 days before
      reminderDate = new Date(targetDate - 30 * 24 * 60 * 60 * 1000);
      break;
    case "daily":
      // If daily, we schedule for tomorrow morning if due date is in the future
      reminderDate = new Date();
      reminderDate.setDate(reminderDate.getDate() + 1);
      reminderDate.setHours(9, 0, 0, 0); // 9 AM tomorrow
      break;
    default:
      // Default to 1 day before if not specified but enabled
      reminderDate = new Date(targetDate - 24 * 60 * 60 * 1000);
  }

  // If the reminder date is in the past, don't schedule
  if (reminderDate.getTime() < Date.now()) {
    console.log("Reminder date is in the past, skipping scheduling.");
    return;
  }

  const title =
    entry.type === "COLLECT"
      ? "Payment Collection Reminder"
      : "Payment Due Reminder";
  const body =
    entry.type === "COLLECT"
      ? `Reminder to collect ${entry.currency} ${entry.principalAmount} from ${entry.counterparty} (Due: ${new Date(targetDate).toLocaleDateString()}).`
      : `Reminder to pay ${entry.currency} ${entry.principalAmount} to ${entry.counterparty} (Due: ${new Date(targetDate).toLocaleDateString()}).`;

  const identifier = await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data: { entryId: entry.id },
    },
    trigger: {
      type: "date",
      date: reminderDate,
    } as any,
  });

  console.log(
    `Notification scheduled with ID: ${identifier} for ${reminderDate.toLocaleString()}`,
  );
  return identifier;
}

export async function cancelNotification(identifier: string) {
  await Notifications.cancelScheduledNotificationAsync(identifier);
}
