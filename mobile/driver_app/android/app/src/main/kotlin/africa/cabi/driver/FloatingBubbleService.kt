package africa.cabi.driver

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.app.Service
import android.content.Context
import android.content.Intent
import android.graphics.Color
import android.graphics.PixelFormat
import android.graphics.Typeface
import android.graphics.drawable.GradientDrawable
import android.os.Build
import android.os.IBinder
import android.util.DisplayMetrics
import android.util.TypedValue
import android.view.Gravity
import android.view.MotionEvent
import android.view.View
import android.view.WindowManager
import android.widget.FrameLayout
import android.widget.ImageView
import android.widget.TextView
import androidx.core.app.NotificationCompat
import kotlin.math.abs

class FloatingBubbleService : Service() {

    private var windowManager: WindowManager? = null
    private var bubbleView: View? = null
    private val CHANNEL_ID = "cabi_driver_floating_bubble"
    private val NOTIFICATION_ID = 48201

    override fun onBind(intent: Intent?): IBinder? = null

    override fun onCreate() {
        super.onCreate()
        startInForeground()
        showFloatingBubble()
    }

    private fun startInForeground() {
        val notificationManager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                CHANNEL_ID,
                "CABI Driver Online Overlay",
                NotificationManager.IMPORTANCE_LOW
            ).apply {
                description = "Shows floating shortcut while CABI Driver is active and online"
                setShowBadge(false)
            }
            notificationManager.createNotificationChannel(channel)
        }

        val launchIntent = Intent(this, MainActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_REORDER_TO_FRONT or Intent.FLAG_ACTIVITY_SINGLE_TOP
        }
        val pendingIntent = PendingIntent.getActivity(
            this,
            0,
            launchIntent,
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) PendingIntent.FLAG_IMMUTABLE else 0
        )

        val notification: Notification = NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle("CABI Driver is Online")
            .setContentText("Tap floating icon to return to driver app")
            .setSmallIcon(android.R.drawable.ic_dialog_map)
            .setContentIntent(pendingIntent)
            .setOngoing(true)
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .build()

        startForeground(NOTIFICATION_ID, notification)
    }

    private fun showFloatingBubble() {
        if (bubbleView != null) return

        windowManager = getSystemService(Context.WINDOW_SERVICE) as WindowManager
        val metrics = DisplayMetrics()
        windowManager?.defaultDisplay?.getMetrics(metrics)
        val screenWidth = metrics.widthPixels

        val dp58 = dpToPx(58)
        val dp12 = dpToPx(12)

        val layoutType = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY
        } else {
            @Suppress("DEPRECATION")
            WindowManager.LayoutParams.TYPE_PHONE
        }

        val params = WindowManager.LayoutParams(
            dp58,
            dp58,
            layoutType,
            WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE or
                    WindowManager.LayoutParams.FLAG_LAYOUT_NO_LIMITS,
            PixelFormat.TRANSLUCENT
        ).apply {
            gravity = Gravity.TOP or Gravity.START
            x = screenWidth - dp58 - dpToPx(12)
            y = dpToPx(180)
        }

        // Root container for bubble
        val root = FrameLayout(this).apply {
            clipChildren = false
            clipToPadding = false
        }

        // Circular background (Black with Gold border)
        val circleBg = GradientDrawable().apply {
            shape = GradientDrawable.OVAL
            setColor(Color.parseColor("#0F0E0C"))
            setStroke(dpToPx(2), Color.parseColor("#F59E0B"))
        }

        val innerCircle = FrameLayout(this).apply {
            background = circleBg
            elevation = dpToPx(6).toFloat()
        }

        // Centered CABI Brand Text / Icon
        val brandText = TextView(this).apply {
            text = "C"
            setTextColor(Color.parseColor("#F59E0B"))
            setTextSize(TypedValue.COMPLEX_UNIT_SP, 24f)
            typeface = Typeface.DEFAULT_BOLD
            gravity = Gravity.CENTER
        }

        val brandParams = FrameLayout.LayoutParams(
            FrameLayout.LayoutParams.MATCH_PARENT,
            FrameLayout.LayoutParams.MATCH_PARENT
        ).apply {
            gravity = Gravity.CENTER
        }
        innerCircle.addView(brandText, brandParams)

        val circleParams = FrameLayout.LayoutParams(
            dpToPx(52),
            dpToPx(52)
        ).apply {
            gravity = Gravity.CENTER
        }
        root.addView(innerCircle, circleParams)

        // Green Online Status Indicator badge (Top Right)
        val greenDot = View(this).apply {
            background = GradientDrawable().apply {
                shape = GradientDrawable.OVAL
                setColor(Color.parseColor("#10B981"))
                setStroke(dpToPx(1), Color.WHITE)
            }
        }
        val dotParams = FrameLayout.LayoutParams(dp12, dp12).apply {
            gravity = Gravity.TOP or Gravity.END
            topMargin = dpToPx(2)
            rightMargin = dpToPx(2)
        }
        root.addView(greenDot, dotParams)

        // Drag & Click listener
        root.setOnTouchListener(object : View.OnTouchListener {
            private var initialX = 0
            private var initialY = 0
            private var initialTouchX = 0f
            private var initialTouchY = 0f

            override fun onTouch(v: View, event: MotionEvent): Boolean {
                when (event.action) {
                    MotionEvent.ACTION_DOWN -> {
                        initialX = params.x
                        initialY = params.y
                        initialTouchX = event.rawX
                        initialTouchY = event.rawY
                        return true
                    }
                    MotionEvent.ACTION_MOVE -> {
                        val dx = (event.rawX - initialTouchX).toInt()
                        val dy = (event.rawY - initialTouchY).toInt()
                        params.x = initialX + dx
                        params.y = initialY + dy
                        try {
                            windowManager?.updateViewLayout(root, params)
                        } catch (_: Exception) {}
                        return true
                    }
                    MotionEvent.ACTION_UP -> {
                        val diffX = abs(event.rawX - initialTouchX)
                        val diffY = abs(event.rawY - initialTouchY)
                        // If finger moved less than 12 pixels, treat as TAP
                        if (diffX < 12 && diffY < 12) {
                            openDriverApp()
                        } else {
                            // Snap to closest screen side (left or right)
                            val mid = screenWidth / 2
                            params.x = if (params.x + dp58 / 2 < mid) {
                                dpToPx(8)
                            } else {
                                screenWidth - dp58 - dpToPx(8)
                            }
                            try {
                                windowManager?.updateViewLayout(root, params)
                            } catch (_: Exception) {}
                        }
                        return true
                    }
                }
                return false
            }
        })

        try {
            windowManager?.addView(root, params)
            bubbleView = root
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    private fun openDriverApp() {
        val intent = Intent(this, MainActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or
                    Intent.FLAG_ACTIVITY_REORDER_TO_FRONT or
                    Intent.FLAG_ACTIVITY_SINGLE_TOP
        }
        startActivity(intent)
    }

    private fun dpToPx(dp: Int): Int {
        return (dp * resources.displayMetrics.density).toInt()
    }

    override fun onDestroy() {
        super.onDestroy()
        if (bubbleView != null) {
            try {
                windowManager?.removeView(bubbleView)
            } catch (_: Exception) {}
            bubbleView = null
        }
        stopForeground(true)
    }
}
