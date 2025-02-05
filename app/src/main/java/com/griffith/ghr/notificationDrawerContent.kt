package com.griffith.ghr

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalConfiguration
import androidx.compose.ui.platform.LocalLayoutDirection
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.LayoutDirection
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

// ------------------------- Notification Drawer -------------------------

/**
 * NotificationDrawerBox - Contains the notification drawer, which opens from the right
 */
@Composable
fun NotificationDrawerBox() {
    // Set layout direction to RTL for opening the drawer from the right
    CompositionLocalProvider(LocalLayoutDirection provides LayoutDirection.Rtl) {
        Box(
            modifier = Modifier
                .fillMaxHeight()
                .width((2 * LocalConfiguration.current.screenWidthDp / 3).dp) // 2/3 of screen width
        ) {
            NotificationDrawerContent() // Display notifications inside the drawer
        }
    }
}

/**
 * NotificationDrawerContent - Holds the content inside the notification drawer.
 */
@Composable
fun NotificationDrawerContent() {
    // Reset layout direction to LTR for proper content alignment
    CompositionLocalProvider(LocalLayoutDirection provides LayoutDirection.Ltr) {
        Column(
            modifier = Modifier
                .fillMaxHeight()
                .padding(16.dp)
        ) {
            // Header Title
            Text(
                text = "Notifications",
                fontSize = 18.sp,
                fontWeight = FontWeight.Bold,
                color = Color.Black,
                modifier = Modifier.padding(bottom = 16.dp) // Adds spacing below the header
            )

            // Sample notification data
            val notifications = listOf(
                "Maintenance request completed.",
                "Delivery collected.",
                "Enquiry completed."
            )

            // Display notification cards
            notifications.forEach { notification ->
                NotificationCard(notification)
            }
        }
    }
}

/**
 * NotificationCard - Displays individual notification messages inside a card.
 */
@Composable
fun NotificationCard(message: String) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 8.dp),
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(containerColor = Color.Gray.copy(alpha = 0.1f))
    ) {
        Text(
            text = message,
            fontSize = 14.sp,
            fontWeight = FontWeight.Normal,
            color = Color.Black,
            modifier = Modifier
                .padding(16.dp)
                .align(Alignment.Start) // Ensures left alignment
        )
    }
}
