package com.focusloop.app;

import android.Manifest;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.media.AudioAttributes;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.speech.tts.TextToSpeech;
import android.speech.tts.UtteranceProgressListener;
import androidx.core.app.ActivityCompat;
import androidx.core.app.NotificationCompat;
import java.util.Locale;

public class ReminderSpeechReceiver extends BroadcastReceiver {
    public static final String ACTION_FIRE = "com.focusloop.app.REMINDER_FIRE";
    private static final String BASE_CHANNEL_ID = "focusloop_v3_"; // Versioned to force sound updates
    private static final String UTTERANCE_ID = "focusloop_reminder";

    @Override
    public void onReceive(Context context, Intent intent) {
        if (!ACTION_FIRE.equals(intent.getAction())) return;

        int id = intent.getIntExtra("id", 0);
        int cycle = intent.getIntExtra("cycle", 1);
        String taskName = intent.getStringExtra("taskName");
        String reminderText = intent.getStringExtra("reminderText");
        String soundTheme = intent.getStringExtra("soundTheme");
        boolean ttsEnabled = intent.getBooleanExtra("ttsEnabled", false);

        if (taskName == null || taskName.trim().isEmpty()) taskName = "FocusLoop";
        if (soundTheme == null || soundTheme.trim().isEmpty()) soundTheme = "Ting";

        if (reminderText == null || reminderText.trim().isEmpty()) {
            reminderText = "Time to check in: " + taskName;
        }

        // If TTS is enabled, we use a silent channel so the notification pops up instantly 
        // while the TTS engine initializes, without clashing with a beep.
        String channelId = BASE_CHANNEL_ID + soundTheme.toLowerCase();
        if (ttsEnabled) {
            channelId += "_silent";
        }

        createChannel(context, channelId, soundTheme, ttsEnabled);
        showNotification(context, id, channelId, taskName, reminderText, cycle);

        if (ttsEnabled) {
            speak(context.getApplicationContext(), reminderText);
        }
    }

    private void createChannel(Context context, String channelId, String soundTheme, boolean silent) {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return;

        NotificationManager manager = (NotificationManager) context.getSystemService(Context.NOTIFICATION_SERVICE);
        
        // Map soundTheme to resource
        int soundResId;
        if (silent) {
            soundResId = 0;
        } else {
            switch (soundTheme) {
                case "Bell": soundResId = R.raw.bell; break;
                case "Chime": soundResId = R.raw.ting; break; 
                case "Announcement": soundResId = R.raw.focus_checkin; break;
                case "Silent": soundResId = 0; break;
                default: soundResId = R.raw.long_reminder; break; // Ting / Default
            }
        }

        NotificationChannel channel = new NotificationChannel(
            channelId,
            "FocusLoop " + (silent ? "Silent" : soundTheme),
            NotificationManager.IMPORTANCE_HIGH
        );
        channel.setDescription("FocusLoop reminders using " + soundTheme);
        
        if (soundResId != 0) {
            Uri soundUri = Uri.parse("android.resource://" + context.getPackageName() + "/" + soundResId);
            AudioAttributes attributes = new AudioAttributes.Builder()
                .setUsage(AudioAttributes.USAGE_NOTIFICATION)
                .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
                .build();
            channel.setSound(soundUri, attributes);
        } else {
            channel.setSound(null, null);
        }

        channel.enableVibration(true);
        channel.setShowBadge(true);
        manager.createNotificationChannel(channel);
    }

    private void showNotification(Context context, int id, String channelId, String taskName, String reminderText, int cycle) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU &&
            ActivityCompat.checkSelfPermission(context, Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED) {
            return;
        }

        Intent launchIntent = context.getPackageManager().getLaunchIntentForPackage(context.getPackageName());
        PendingIntent contentIntent = PendingIntent.getActivity(
            context,
            id,
            launchIntent,
            PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );

        NotificationCompat.Builder builder = new NotificationCompat.Builder(context, channelId)
            .setSmallIcon(android.R.drawable.ic_dialog_info)
            .setContentTitle("Task Alert: " + taskName)
            .setContentText("Cycle " + cycle + " finished!")
            .setStyle(new NotificationCompat.BigTextStyle()
                .setBigContentTitle("Task Alert: " + taskName)
                .bigText(reminderText + "\n\nCycle " + cycle + " complete. FocusLoop is ready for your next session."))
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setCategory(NotificationCompat.CATEGORY_REMINDER)
            .setOngoing(false)
            .setAutoCancel(true)
            .setContentIntent(contentIntent);

        NotificationManager manager = (NotificationManager) context.getSystemService(Context.NOTIFICATION_SERVICE);
        manager.notify(id, builder.build());
    }

    private void speak(Context context, String text) {
        final BroadcastReceiver.PendingResult pendingResult = goAsync();
        final TextToSpeech[] ttsRef = new TextToSpeech[1];

        ttsRef[0] = new TextToSpeech(context, status -> {
            if (status != TextToSpeech.SUCCESS) {
                if (pendingResult != null) pendingResult.finish();
                return;
            }

            TextToSpeech tts = ttsRef[0];
            tts.setLanguage(Locale.getDefault());
            tts.setSpeechRate(0.95f);
            tts.setPitch(1.0f);
            tts.setOnUtteranceProgressListener(new UtteranceProgressListener() {
                @Override
                public void onStart(String utteranceId) {}

                @Override
                public void onDone(String utteranceId) {
                    tts.shutdown();
                    if (pendingResult != null) pendingResult.finish();
                }

                @Override
                public void onError(String utteranceId) {
                    tts.shutdown();
                    if (pendingResult != null) pendingResult.finish();
                }
            });

            Bundle params = new Bundle();
            params.putString(TextToSpeech.Engine.KEY_PARAM_UTTERANCE_ID, UTTERANCE_ID);
            tts.speak(text, TextToSpeech.QUEUE_FLUSH, params, UTTERANCE_ID);
        });
    }
}
