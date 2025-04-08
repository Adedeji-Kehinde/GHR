package com.griffith.ghr

import androidx.compose.foundation.Image
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.size
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.Menu
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.navigation.NavController

// ------------------------- Logo Component -------------------------

/**
 * Displays the app logo at the center.
 */
@Composable
fun AppLogo() {
    Image(
        painter = painterResource(id = R.drawable.logo),
        contentDescription = "App Logo",
        modifier = Modifier.size(40.dp)
    )
}

// ------------------------- Icon Components -------------------------

/**
 * Menu Icon - Displays the menu icon on the left.
 */
@Composable
fun MenuIcon(onClick: () -> Unit) {
    IconButton(onClick = onClick) {
        Icon(
            imageVector = Icons.Filled.Menu,
            contentDescription = "Open Menu",
            tint = Color.White
        )
    }
}

/**
 * Back Arrow Icon - Displays a back button on the left.
 */
@Composable
fun BackArrowIcon(onClick: () -> Unit) {
    IconButton(onClick = onClick) {
        Icon(
            imageVector = Icons.AutoMirrored.Filled.ArrowBack,
            contentDescription = "Go Back",
            tint = Color.White
        )
    }
}

// ------------------------- Header Component -------------------------

/**
 * AppHeader - A top app bar with a centered logo, menu icon, and optional back button.
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AppHeader(
    onMenuClick: () -> Unit, // Action when the menu button is clicked
    navController: NavController, // Navigation controller to handle back navigation
    showBackButton: Boolean = false // Whether to show the back button
) {
    CenterAlignedTopAppBar(
        title = { AppLogo() },
        navigationIcon = {
            Row(verticalAlignment = Alignment.CenterVertically) {
                MenuIcon(onClick = onMenuClick) // Menu icon (always present)
                if (showBackButton) {
                    BackArrowIcon(onClick = { navController.popBackStack() }) // Back button if enabled
                }
            }
        },
        colors = TopAppBarDefaults.centerAlignedTopAppBarColors(
            containerColor = Color.Red // App bar background color remains red
        )
    )
}

// ------------------------- Preview -------------------------

/**
 * Preview of the AppHeader component with dummy navigation.
 */
@Preview(showBackground = true)
@Composable
fun AppHeaderPreview() {
    AppHeader(
        onMenuClick = {},
        navController = NavController(LocalContext.current),
        showBackButton = true // Enables the back button in the preview
    )
}
