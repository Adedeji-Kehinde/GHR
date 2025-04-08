package com.griffith.ghr

import android.content.Context
import android.util.Log
import android.widget.Toast
import androidx.compose.foundation.Image
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.navigation.NavController
import coil.compose.rememberAsyncImagePainter
import kotlinx.coroutines.launch

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AnnouncementDetailsPage(navController: NavController, announcementId: String) {
    val scope = rememberCoroutineScope()
    val context = LocalContext.current
    val menuDrawerState = rememberDrawerState(DrawerValue.Closed)
    var announcementDetails by remember { mutableStateOf<Announcement?>(null) }

    // Retrofit setup using your provideRetrofit() function
    val retrofit = remember { provideRetrofit() }
    val announcementApi = retrofit.create(AnnouncementApi::class.java)

    // Fetch announcement details from the backend.
    LaunchedEffect(announcementId) {
        val sharedPreferences = context.getSharedPreferences("AppPrefs", Context.MODE_PRIVATE)
        val token = sharedPreferences.getString("authToken", null)
        if (token != null) {
            try {
                val announcements = announcementApi.getAnnouncements() // Assuming only approved announcements are returned
                announcementDetails = announcements.find { it.id == announcementId }
                if (announcementDetails == null) {
                    Toast.makeText(context, "Announcement not found.", Toast.LENGTH_LONG).show()
                }
            } catch (e: Exception) {
                Log.e("AnnouncementDetailsPage", "Error fetching announcement", e)
                Toast.makeText(context, "Failed to fetch announcement details.", Toast.LENGTH_LONG).show()
            }
        } else {
            Toast.makeText(context, "No authentication token found. Please log in again.", Toast.LENGTH_LONG).show()
        }
    }

    // UI using ModalNavigationDrawer and Scaffold.
    ModalNavigationDrawer(
        drawerState = menuDrawerState,
        drawerContent = { ModalDrawerSheet { MenuDrawerContent(navController) } },
        modifier = Modifier.fillMaxSize()
    ) {
        Scaffold(
            topBar = {
                AppHeader(
                    onMenuClick = { scope.launch { menuDrawerState.open() } },
                    navController = navController,
                    showBackButton = true
                )
            },
            // Remove bottomBar altogether (no favourite button).
            content = { innerPadding ->
                AnnouncementDetailsContent(
                    announcementDetails = announcementDetails,
                    innerPadding = innerPadding
                )
            }
        )
    }
}

@Composable
fun AnnouncementDetailsContent(announcementDetails: Announcement?, innerPadding: PaddingValues) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
            .padding(innerPadding)
            .padding(16.dp),
        verticalArrangement = Arrangement.Top,
        horizontalAlignment = Alignment.Start
    ) {
        Spacer(modifier = Modifier.height(16.dp))
        if (announcementDetails != null) {
            Text(
                text = announcementDetails.title,
                fontSize = 20.sp,
                fontWeight = FontWeight.Bold,
                color = MaterialTheme.colorScheme.onBackground
            )
            Spacer(modifier = Modifier.height(8.dp))
            Text(
                text = formatDateTime(announcementDetails.createdAt),
                fontSize = 14.sp,
                color = Color.Gray
            )
            Spacer(modifier = Modifier.height(16.dp))
            Text(
                text = announcementDetails.message,
                fontSize = 16.sp,
                color = MaterialTheme.colorScheme.onBackground
            )
            Spacer(modifier = Modifier.height(16.dp))
            if (announcementDetails.attachments.isNotEmpty()) {
                Text(
                    text = "Attachments:",
                    fontSize = 16.sp,
                    fontWeight = FontWeight.Medium,
                    color = MaterialTheme.colorScheme.onBackground
                )
                Spacer(modifier = Modifier.height(8.dp))
                announcementDetails.attachments.forEach { url ->
                    Image(
                        painter = rememberAsyncImagePainter(url),
                        contentDescription = "Attachment Image",
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(150.dp) // Reduced height; adjust as needed.
                            .padding(bottom = 8.dp),
                        contentScale = ContentScale.Fit
                    )
                }
            }
        } else {
            Box(
                modifier = Modifier.fillMaxSize(),
                contentAlignment = Alignment.Center
            ) {
                CircularProgressIndicator()
            }
        }
    }
}
