package africa.cabi.driver

import android.content.Intent
import android.net.Uri
import android.os.Build
import android.provider.Settings
import io.flutter.embedding.android.FlutterActivity
import io.flutter.embedding.engine.FlutterEngine
import io.flutter.plugin.common.MethodChannel

class MainActivity : FlutterActivity() {
    private val CHANNEL = "africa.cabi.driver/floating_bubble"

    override fun configureFlutterEngine(flutterEngine: FlutterEngine) {
        super.configureFlutterEngine(flutterEngine)

        MethodChannel(flutterEngine.dartExecutor.binaryMessenger, CHANNEL).setMethodCallHandler { call, result ->
            when (call.method) {
                "checkOverlayPermission" -> {
                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                        result.success(Settings.canDrawOverlays(this))
                    } else {
                        result.success(true)
                    }
                }
                "requestOverlayPermission" -> {
                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M && !Settings.canDrawOverlays(this)) {
                        val intent = Intent(
                            Settings.ACTION_MANAGE_OVERLAY_PERMISSION,
                            Uri.parse("package:$packageName")
                        ).apply {
                            addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                        }
                        startActivity(intent)
                    }
                    result.success(true)
                }
                "showBubble" -> {
                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M && !Settings.canDrawOverlays(this)) {
                        result.success(false)
                    } else {
                        val intent = Intent(this, FloatingBubbleService::class.java)
                        try {
                            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                                startForegroundService(intent)
                            } else {
                                startService(intent)
                            }
                            result.success(true)
                        } catch (e: Exception) {
                            result.error("SERVICE_ERROR", e.message, null)
                        }
                    }
                }
                "hideBubble" -> {
                    val intent = Intent(this, FloatingBubbleService::class.java)
                    stopService(intent)
                    result.success(true)
                }
                else -> result.notImplemented()
            }
        }
    }
}
