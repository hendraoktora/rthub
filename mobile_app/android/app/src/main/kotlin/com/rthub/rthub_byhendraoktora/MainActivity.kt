package com.rthub.rthub_byhendraoktora

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.content.Context
import android.content.Intent
import android.graphics.Color
import android.media.AudioAttributes
import android.media.AudioManager
import android.media.MediaPlayer
import android.net.Uri
import android.os.Build
import android.os.Bundle
import io.flutter.embedding.android.FlutterActivity
import io.flutter.embedding.engine.FlutterEngine
import io.flutter.plugin.common.MethodChannel

class MainActivity : FlutterActivity() {
    private val CHANNEL = "com.rthub.rthub_mobile/widget"
    private var initialAction: String? = null
    private var panicMediaPlayer: MediaPlayer? = null

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        createNotificationChannels()
    }

    private fun createNotificationChannels() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val notificationManager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager

            // 1. Regular High Importance Channel (Pengumuman & Iuran)
            val generalChannel = NotificationChannel(
                "rthub_high_importance_channel",
                "RTHub Pengumuman & Tagihan",
                NotificationManager.IMPORTANCE_HIGH
            ).apply {
                description = "Pengumuman warga, berita lingkungan, dan info tagihan"
                enableVibration(true)
                enableLights(true)
                setShowBadge(true)
            }
            notificationManager.createNotificationChannel(generalChannel)

            // 2. CRITICAL EMERGENCY SOS / PANIC CHANNEL (Overriding Silent via USAGE_ALARM & Siren Sound)
            val sirenUri = Uri.parse("android.resource://" + packageName + "/" + R.raw.siren)
            val alarmAttributes = AudioAttributes.Builder()
                .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
                .setUsage(AudioAttributes.USAGE_ALARM) // Uses STREAM_ALARM to sound even on silent/vibrate!
                .build()

            val panicChannel = NotificationChannel(
                "rthub_panic_channel",
                "🚨 RTHub Alarm Darurat (SOS)",
                NotificationManager.IMPORTANCE_HIGH
            ).apply {
                description = "Alarm darurat SOS warga RTHub (suara sirine keras & bergetar)"
                setSound(sirenUri, alarmAttributes)
                enableVibration(true)
                vibrationPattern = longArrayOf(0, 1000, 300, 1000, 300, 1000, 300, 1000)
                enableLights(true)
                lightColor = Color.RED
                lockscreenVisibility = Notification.VISIBILITY_PUBLIC
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                    setBypassDnd(true)
                }
            }
            notificationManager.createNotificationChannel(panicChannel)
        }
    }

    private fun playPanicAlarm() {
        try {
            stopPanicAlarm()
            val audioManager = getSystemService(Context.AUDIO_SERVICE) as AudioManager
            val maxVolume = audioManager.getStreamMaxVolume(AudioManager.STREAM_ALARM)
            val currentVolume = audioManager.getStreamVolume(AudioManager.STREAM_ALARM)
            // Ensure audible alarm volume
            if (currentVolume < (maxVolume * 0.7).toInt()) {
                audioManager.setStreamVolume(AudioManager.STREAM_ALARM, (maxVolume * 0.9).toInt(), 0)
            }

            panicMediaPlayer = MediaPlayer.create(this, R.raw.siren)?.apply {
                setAudioAttributes(
                    AudioAttributes.Builder()
                        .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
                        .setUsage(AudioAttributes.USAGE_ALARM)
                        .build()
                )
                isLooping = true
                start()
            }
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    private fun stopPanicAlarm() {
        try {
            panicMediaPlayer?.let {
                if (it.isPlaying) {
                    it.stop()
                }
                it.release()
            }
            panicMediaPlayer = null
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    override fun onDestroy() {
        stopPanicAlarm()
        super.onDestroy()
    }

    override fun configureFlutterEngine(flutterEngine: FlutterEngine) {
        super.configureFlutterEngine(flutterEngine)

        if (intent?.action == "com.rthub.rthub_byhendraoktora.PANIC_ALERT" || intent?.getStringExtra("route") == "panic") {
            initialAction = "panic"
        }

        MethodChannel(flutterEngine.dartExecutor.binaryMessenger, CHANNEL).setMethodCallHandler { call, result ->
            when (call.method) {
                "getInitialAction" -> {
                    val action = initialAction
                    initialAction = null
                    result.success(action)
                }
                "playPanicAlarm" -> {
                    playPanicAlarm()
                    result.success(true)
                }
                "stopPanicAlarm" -> {
                    stopPanicAlarm()
                    result.success(true)
                }
                else -> result.notImplemented()
            }
        }
    }

    override fun onNewIntent(intent: Intent) {
        super.onNewIntent(intent)
        setIntent(intent)
        if (intent.action == "com.rthub.rthub_byhendraoktora.PANIC_ALERT" || intent.getStringExtra("route") == "panic") {
            flutterEngine?.dartExecutor?.binaryMessenger?.let { messenger ->
                MethodChannel(messenger, CHANNEL).invokeMethod("onPanicTriggered", null)
            }
        }
    }
}
