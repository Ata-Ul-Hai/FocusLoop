package com.focusloop.app;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void load() {
        registerPlugin(ReminderSpeechPlugin.class);
        super.load();
    }
}
