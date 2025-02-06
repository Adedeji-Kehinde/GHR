package com.griffith.ghr

import android.content.Context
import androidx.compose.animation.core.Animatable
import androidx.compose.animation.core.FastOutSlowInEasing
import androidx.compose.animation.core.tween
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.unit.dp
import androidx.navigation.NavController
import kotlinx.coroutines.delay

// ------------------------- SPLASH SCREEN -------------------------

/**
 * Splash Screen - Displays an animated logo and navigates to the next screen.
 */
@Composable
fun SplashScreen(navController: NavController) {
    val splashDuration = 1000L // 1 second splash duration
    val context = LocalContext.current
    val scale = remember { Animatable(0f) }

    // Animation and navigation logic
    LaunchedEffect(Unit) {
        // Animate the logo appearance
        scale.animateTo(
            targetValue = 1f,
            animationSpec = tween(durationMillis = 1000, easing = FastOutSlowInEasing)
        )
        delay(splashDuration)

        // Retrieve authentication token from SharedPreferences
        val sharedPreferences = context.getSharedPreferences("AppPrefs", Context.MODE_PRIVATE)
        val token = sharedPreferences.getString("authToken", null)

        // Navigate based on authentication status
        navController.navigate(if (token != null) "HomePage" else "LoginPage") {
            popUpTo(0) // Clear the back stack to prevent going back to the splash screen
        }
    }

    // Splash Screen UI
    Box(
        modifier = Modifier.fillMaxSize().background(Color.White),
        contentAlignment = Alignment.Center
    ) {
        // App Logo with Circular Shape
        Image(
            painter = painterResource(id = R.drawable.app_logo),
            contentDescription = "App Logo",
            modifier = Modifier.size(100.dp).clip(CircleShape)
        )
    }
}
