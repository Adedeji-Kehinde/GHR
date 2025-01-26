package com.griffith.ghr

import android.content.Context
import androidx.compose.animation.core.Animatable
import androidx.compose.animation.core.FastOutSlowInEasing
import androidx.compose.animation.core.tween
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.painterResource
import androidx.navigation.NavController
import kotlinx.coroutines.delay

@Composable
fun SplashScreen(navController: NavController) {
    val splashDuration = 1000L // 1 seconds
    val context = LocalContext.current
    val scale = remember { Animatable(0f) }

    // Navigate to the next screen after the duration
    LaunchedEffect(Unit) {
        scale.animateTo(
            targetValue = 1f,
            animationSpec = tween(durationMillis = 1000, easing = FastOutSlowInEasing)
        )
        delay(splashDuration)
        val sharedPreferences = context.getSharedPreferences("AppPrefs", Context.MODE_PRIVATE)
        val token = sharedPreferences.getString("authToken", null)

        if (token != null) {
            navController.navigate("HomePage") {
                popUpTo(0) // Clear the back stack
            }
        } else {
            navController.navigate("LoginPage") {
                popUpTo(0) // Clear the back stack
            }
        }
    }

    // Splash Screen UI
    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(Color.White),
        contentAlignment = Alignment.Center
    ) {
        // App Logo with Circular Shape
        Image(
            painter = painterResource(id = R.drawable.app_logo), // Replace with your logo resource
            contentDescription = "App Logo",
            modifier = Modifier
                .clip(CircleShape) // Make the image circular
        )
    }
}
