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

@Composable
fun NotificationDrawerBox() {
    // Apply RTL layout direction for drawer opening, but keep the content LTR
    CompositionLocalProvider(LocalLayoutDirection provides LayoutDirection.Rtl) {
        Box(
            modifier = Modifier
                .fillMaxHeight()
                .width((2 * LocalConfiguration.current.screenWidthDp / 3).dp) // 2/3 width

        ) {
            NotificationDrawerContent() // Notification content stays LTR
        }
    }
}

@Composable
fun NotificationDrawerContent() {
    // Reset LocalLayoutDirection to LTR for the content inside the drawer
    CompositionLocalProvider(LocalLayoutDirection provides LayoutDirection.Ltr) {
        Column(
            modifier = Modifier
                .fillMaxHeight() // Drawer fills the height
                .padding(16.dp)
        ) {
            // Header for notifications
            Text(
                text = "Notifications",
                modifier = Modifier
                    .padding(bottom = 16.dp), // Add space after the header
                fontSize = 18.sp,
                fontWeight = FontWeight.Bold,
                color = Color.Black
            )

            // Random notification data
            val notifications = listOf(
                "Maintenance request Completed.",
                "Delivery Collected",
                "Enquiry Completed",
            )

            notifications.forEach { notification ->
                Card(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(vertical = 8.dp),
                    shape = RoundedCornerShape(12.dp),
                    colors = CardDefaults.cardColors(containerColor = Color.Gray.copy(alpha = 0.1f))
                ) {
                    Text(
                        text = notification,
                        modifier = Modifier
                            .padding(16.dp)
                            .align(Alignment.Start), // Ensure left alignment
                        fontSize = 14.sp,
                        fontWeight = FontWeight.Normal,
                        color = Color.Black
                    )
                }
            }
        }
    }
}
