package com.griffith.ghr

import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.painter.Painter
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.text.font.FontWeight
import androidx.navigation.NavController

@Composable
fun MenuDrawerContent(navController: NavController) {

    val placeholderImage: Painter = painterResource(id = R.drawable.app_logo)

    val userName = "John Doe"
    val userEmail = "john.doe@example.com"

    Column(
        modifier = Modifier
            .fillMaxHeight()
            .width(280.dp)
            .padding(16.dp)
    ) {
        // User profile section
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .clickable { navController.navigate("UserProfilePage") }, // Navigate to UserProfilePage
            verticalAlignment = Alignment.CenterVertically
        ) {
            // User profile image in a circular shape
            Box(
                modifier = Modifier
                    .size(60.dp)
                    .background(Color.Gray, shape = CircleShape)
            ) {
                Image(
                    painter = placeholderImage,
                    contentDescription = "User Profile Image",
                    modifier = Modifier.fillMaxSize()
                )
            }
            Spacer(modifier = Modifier.width(16.dp))
            // User name and email
            Column {
                Text(
                    text = userName,
                    fontSize = 20.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color.Black
                )
                Text(
                    text = userEmail,
                    fontSize = 14.sp,
                    color = Color.Gray
                )
            }
        }
        Spacer(modifier = Modifier.height(8.dp)) // Add space below the profile section
        HorizontalDivider(modifier = Modifier.padding(vertical = 8.dp))
        Spacer(modifier = Modifier.height(16.dp)) // Add space below the profile section

        // Menu items
        LazyColumn {
            item {
                ListItem(
                    headlineContent = {
                        Text(text = "Home", fontSize = 20.sp)
                    },
                    modifier = Modifier.clickable {
                        navController.navigate("HomePage") // Navigate to HomePage
                    }
                )
            }
            item {
                Spacer(modifier = Modifier.height(16.dp)) // Add space between items
            }
            item {
                ListItem(
                    headlineContent = {
                        Text(text = "Deliveries", fontSize = 20.sp)
                    },
                    modifier = Modifier.clickable {
                        navController.navigate("DeliveriesPage") // Navigate to DeliveriesPage
                    }
                )
            }
            item {
                Spacer(modifier = Modifier.height(16.dp)) // Add space between items
            }
            item {
                ListItem(
                    headlineContent = {
                        Text(text = "Maintenance", fontSize = 20.sp)
                    },
                    modifier = Modifier.clickable {
                        navController.navigate("MaintenancePage") // Navigate to MaintenancePage
                    }
                )
            }
            item {
                Spacer(modifier = Modifier.height(16.dp)) // Add space between items
            }
            item {
                ListItem(
                    headlineContent = {
                        Text(text = "Enquiries", fontSize = 20.sp)
                    },
                    modifier = Modifier.clickable {
                        navController.navigate("EnquiriesPage") // Navigate to EnquiriesPage
                    }
                )
            }
        }
    }
}
