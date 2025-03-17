package com.griffith.ghr

import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.util.Log
import androidx.core.app.NotificationCompat
import com.google.firebase.messaging.FirebaseMessagingService
import com.google.firebase.messaging.RemoteMessage
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory

class MyFirebaseMessagingService : FirebaseMessagingService() {

    override fun onMessageReceived(remoteMessage: RemoteMessage) {
        super.onMessageReceived(remoteMessage)
        Log.d("FCM", "Message received: ${remoteMessage.data}")

        // If the message contains a notification payload.
        remoteMessage.notification?.let {
            val title = it.title ?: "Notification"
            val body = it.body ?: "You have a new notification."
            sendNotification(title, body)
        }

        // Handle any data payload
        if (remoteMessage.data.isNotEmpty()) {
            val type = remoteMessage.data["type"] ?: "default"
            val message = remoteMessage.data["message"] ?: "You have a new update."
            sendNotification("New update: $type", message)
        }
    }

    override fun onNewToken(token: String) {
        super.onNewToken(token)
        Log.d("FCM", "New token: $token")
        // Call the function to send the new token to your backend
        sendTokenToServer(token)
    }

    private fun sendNotification(title: String, messageBody: String) {
        val intent = Intent(this, MainActivity::class.java).apply {
            addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP or Intent.FLAG_ACTIVITY_SINGLE_TOP)
        }
        val pendingIntent = PendingIntent.getActivity(
            this, 0, intent,
            PendingIntent.FLAG_IMMUTABLE
        )

        val channelId = "default_channel_id"
        val defaultSoundUri =
            android.media.RingtoneManager.getDefaultUri(android.media.RingtoneManager.TYPE_NOTIFICATION)
        val largeIconBitmap = android.graphics.BitmapFactory.decodeResource(resources, R.drawable.app_logo)

        val notificationBuilder = NotificationCompat.Builder(this, channelId)
            .setSmallIcon(R.drawable.logo)
            .setContentTitle(title)
            .setContentText(messageBody)
            .setAutoCancel(true)
            .setSound(defaultSoundUri)
            .setContentIntent(pendingIntent)
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setLargeIcon(largeIconBitmap)


        val notificationManager =
            getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager

        val channel = NotificationChannel(
            channelId,
            "Default Channel",
            NotificationManager.IMPORTANCE_HIGH
        )
        notificationManager.createNotificationChannel(channel)

        notificationManager.notify(System.currentTimeMillis().toInt(), notificationBuilder.build())
    }

    /**
     * Retrieves the JWT token from SharedPreferences and sends the new FCM token
     * to your backend using Retrofit.
     */
    private fun sendTokenToServer(fcmToken: String) {
        // Retrieve the JWT token from SharedPreferences (stored at login)
        val sharedPreferences = getSharedPreferences("AppPrefs", Context.MODE_PRIVATE)
        val jwtToken = sharedPreferences.getString("authToken", null)

        if (jwtToken.isNullOrEmpty()) {
            Log.e("FCM", "JWT token not found, cannot update FCM token on server")
            return
        }

        // Setup Retrofit with your base URL
        val retrofit = Retrofit.Builder()
            .baseUrl("https://ghr-1.onrender.com/")
            .addConverterFactory(GsonConverterFactory.create())
            .build()

        val updateTokenApi = retrofit.create(UpdateTokenApi::class.java)
        val tokenData = mapOf("fcmToken" to fcmToken)

        // Use a coroutine to call the API on the IO dispatcher
        CoroutineScope(Dispatchers.IO).launch {
            try {
                // Prepend "Bearer " to your JWT token
                val authHeader = "Bearer $jwtToken"
                val response = updateTokenApi.updateToken(authHeader, tokenData)
                Log.d("FCM", "FCM token updated on server from : $response")
            } catch (e: Exception) {
                Log.e("FCM", "Error updating token on server: ${e.message}")
            }
        }
    }
}
