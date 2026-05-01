package com.focusloop.app;

import android.app.AlarmManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Build;
import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import org.json.JSONArray;
import org.json.JSONObject;

@CapacitorPlugin(name = "ReminderSpeech")
public class ReminderSpeechPlugin extends Plugin {
    private static final String PREFS = "focusloop_reminder_speech";

    @PluginMethod
    public void schedule(PluginCall call) {
        JSArray reminders = call.getArray("reminders");
        if (reminders == null) {
            call.reject("Missing reminders");
            return;
        }

        try {
            AlarmManager alarmManager = (AlarmManager) getContext().getSystemService(Context.ALARM_SERVICE);
            JSONArray reminderArray = reminders.toString() == null ? new JSONArray() : new JSONArray(reminders.toString());

            for (int i = 0; i < reminderArray.length(); i++) {
                JSONObject reminder = reminderArray.getJSONObject(i);
                scheduleReminder(alarmManager, reminder);
            }

            call.resolve();
        } catch (Exception error) {
            call.reject("Unable to schedule spoken reminders", error);
        }
    }

    @PluginMethod
    public void startForegroundService(PluginCall call) {
        String taskName = call.getString("taskName", "Tasks");
        Intent intent = new Intent(getContext(), FocusForegroundService.class);
        intent.putExtra("taskName", taskName);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            getContext().startForegroundService(intent);
        } else {
            getContext().startService(intent);
        }
        call.resolve();
    }

    @PluginMethod
    public void stopForegroundService(PluginCall call) {
        Intent intent = new Intent(getContext(), FocusForegroundService.class);
        getContext().stopService(intent);
        call.resolve();
    }

    @PluginMethod
    public void requestBatteryOptimizations(PluginCall call) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            String packageName = getContext().getPackageName();
            android.os.PowerManager pm = (android.os.PowerManager) getContext().getSystemService(Context.POWER_SERVICE);
            if (!pm.isIgnoringBatteryOptimizations(packageName)) {
                Intent intent = new Intent();
                intent.setAction(android.provider.Settings.ACTION_REQUEST_IGNORE_BATTERY_OPTIMIZATIONS);
                intent.setData(android.net.Uri.parse("package:" + packageName));
                getContext().startActivity(intent);
            }
        }
        call.resolve();
    }

    @PluginMethod
    public void cancelTask(PluginCall call) {
        String taskId = call.getString("taskId");
        if (taskId == null || taskId.isEmpty()) {
            call.reject("Missing taskId");
            return;
        }

        cancelTaskReminders(taskId);
        call.resolve();
    }

    private void scheduleReminder(AlarmManager alarmManager, JSONObject reminder) throws Exception {
        String taskId = reminder.getString("taskId");
        int id = reminder.getInt("id");
        long at = reminder.getLong("at");
        String taskName = reminder.optString("taskName", "FocusLoop");
        String reminderText = reminder.optString("reminderText", "FocusLoop reminder");
        boolean ttsEnabled = reminder.optBoolean("ttsEnabled", false);
        String soundTheme = reminder.optString("soundTheme", "Ting");
        int cycle = reminder.optInt("cycle", 1);

        Intent intent = new Intent(getContext(), ReminderSpeechReceiver.class);
        intent.setAction(ReminderSpeechReceiver.ACTION_FIRE);
        intent.putExtra("id", id);
        intent.putExtra("taskId", taskId);
        intent.putExtra("taskName", taskName);
        intent.putExtra("reminderText", reminderText);
        intent.putExtra("ttsEnabled", ttsEnabled);
        intent.putExtra("soundTheme", soundTheme);
        intent.putExtra("cycle", cycle);

        PendingIntent pendingIntent = PendingIntent.getBroadcast(
            getContext(),
            id,
            intent,
            PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S && !alarmManager.canScheduleExactAlarms()) {
            alarmManager.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, at, pendingIntent);
        } else if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            alarmManager.setExactAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, at, pendingIntent);
        } else {
            alarmManager.setExact(AlarmManager.RTC_WAKEUP, at, pendingIntent);
        }

        rememberReminderId(taskId, id);
    }

    private void cancelTaskReminders(String taskId) {
        AlarmManager alarmManager = (AlarmManager) getContext().getSystemService(Context.ALARM_SERVICE);
        SharedPreferences prefs = getContext().getSharedPreferences(PREFS, Context.MODE_PRIVATE);
        String ids = prefs.getString(taskId, "");

        if (!ids.isEmpty()) {
            String[] parts = ids.split(",");
            for (String part : parts) {
                if (part.isEmpty()) continue;
                int id = Integer.parseInt(part);
                Intent intent = new Intent(getContext(), ReminderSpeechReceiver.class);
                intent.setAction(ReminderSpeechReceiver.ACTION_FIRE);
                PendingIntent pendingIntent = PendingIntent.getBroadcast(
                    getContext(),
                    id,
                    intent,
                    PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
                );
                alarmManager.cancel(pendingIntent);
                pendingIntent.cancel();
            }
        }

        prefs.edit().remove(taskId).apply();
    }

    private void rememberReminderId(String taskId, int id) {
        SharedPreferences prefs = getContext().getSharedPreferences(PREFS, Context.MODE_PRIVATE);
        String existing = prefs.getString(taskId, "");
        String idText = String.valueOf(id);
        if (existing.equals(idText) || existing.contains("," + idText + ",") || existing.startsWith(idText + ",") || existing.endsWith("," + idText)) {
            return;
        }
        String updated = existing.isEmpty() ? idText : existing + "," + idText;
        prefs.edit().putString(taskId, updated).apply();
    }
}
