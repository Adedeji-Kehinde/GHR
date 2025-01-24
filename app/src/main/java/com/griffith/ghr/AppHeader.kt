package com.griffith.ghr

import androidx.compose.foundation.Image
import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.Menu
import androidx.compose.material.icons.filled.Notifications
import androidx.compose.material3.*
import androidx.compose.material3.TopAppBarDefaults.topAppBarColors
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.navigation.NavController

// Logo Composable
@Composable
fun AppLogo() {
    Box(
        modifier = Modifier.fillMaxWidth(), // Make the Box fill the width
        contentAlignment = Alignment.Center // Center-align the logo inside the Box
    ) {
        Image(
            painter = painterResource(id = R.drawable.app_logo), // Replace with your logo
            contentDescription = "App Logo",
            modifier = Modifier.size(40.dp) // Adjust size as needed
        )
    }
}

// Menu Icon Composable (Left Icon)
@Composable
fun MenuIcon(onClick: () -> Unit) {
    IconButton(onClick = onClick) {
        Icon(
            imageVector = Icons.Filled.Menu,
            contentDescription = "Open Menu",
            tint = Color.White // Set the icon color to white
        )
    }
}

// Back Arrow Icon Composable (Left Icon)
@Composable
fun BackArrowIcon(onClick: () -> Unit) {
    IconButton(onClick = onClick) {
        Icon(
            imageVector = Icons.Filled.ArrowBack,
            contentDescription = "Go Back",
            tint = Color.White // Set the icon color to white
        )
    }
}

// Notification Icon Composable (Right Icon)
@Composable
fun NotificationIcon(onClick: () -> Unit) {
    IconButton(onClick = onClick) {
        Icon(
            imageVector = Icons.Filled.Notifications,
            contentDescription = "Open Notifications",
            tint = Color.White // Set the icon color to white
        )
    }
}

// The main Header Composable
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AppHeader(
    onMenuClick: () -> Unit, // Action when the menu button is clicked
    onNotificationClick: () -> Unit, // Action when the notification button is clicked
    navController: NavController, // Navigation controller to pop the back stack
    showBackButton: Boolean = false // Flag to decide whether to show back button
) {
    TopAppBar(
        title = { AppLogo() }, // Center-aligned logo
        navigationIcon = {
            Row() {
                MenuIcon(onClick = onMenuClick) // Left button for menu
                if (showBackButton) {
                    BackArrowIcon(onClick = {
                        navController.popBackStack() // Pop the current screen off the stack
                    })
                }
            }
        },
        actions = { NotificationIcon(onClick = onNotificationClick) }, // Right button for notification
        modifier = Modifier.fillMaxWidth(),
        colors = topAppBarColors(
            containerColor = Color.Red // Set the background color to bright red
        )
    )
}

@Preview(showBackground = true)
@Composable
fun AppHeaderPreview() {
    AppHeader(
        onMenuClick = {},
        onNotificationClick = {},
        navController = NavController(context = LocalContext.current), // Pass a dummy NavController here for preview
        showBackButton = true // Show the back button
    )
}
