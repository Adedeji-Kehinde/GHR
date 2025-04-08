package com.griffith.ghr

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.dp
import androidx.navigation.NavController
import kotlinx.coroutines.launch
import retrofit2.Retrofit

@Composable
fun AnnouncementsListScreen(navController: NavController) {
    // State to hold announcements.
    val announcements = remember { mutableStateOf<List<Announcement>>(emptyList()) }
    val scope = rememberCoroutineScope()
    val context = LocalContext.current

    // Retrofit setup.
    val retrofit: Retrofit = provideRetrofit()
    val announcementApi = retrofit.create(AnnouncementApi::class.java)

    // Fetch announcements on load; filter to show only approved ones.
    LaunchedEffect(Unit) {
        try {
            val result = announcementApi.getAnnouncements()
            announcements.value = result.filter { it.approved }
        } catch (e: Exception) {
            println("Error fetching announcements: ${e.message}")
        }
    }

    // No tabs here; just display the list.
    val menuDrawerState = rememberDrawerState(DrawerValue.Closed)

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
            content = { innerPadding ->
                Column(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(innerPadding)
                        .padding(16.dp)
                ) {
                    // (Optional) A header text if needed.
                    Text(
                        text = "Announcements",
                        style = MaterialTheme.typography.titleLarge,
                        modifier = Modifier.padding(bottom = 8.dp)
                    )
                    LazyColumn(
                        modifier = Modifier.fillMaxSize()
                    ) {
                        items(announcements.value) { announcement ->
                            AnnouncementRow(announcement = announcement) {
                                navController.navigate("announcementDetails/${announcement.id}")
                            }
                        }
                    }
                }
            }
        )
    }
}

@Composable
fun AnnouncementRow(announcement: Announcement, onClick: () -> Unit) {
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .clickable { onClick() }
            .padding(vertical = 8.dp)
    ) {
        Text(
            text = announcement.title,
            style = MaterialTheme.typography.titleMedium
        )
        Spacer(modifier = Modifier.height(4.dp))
        Text(
            text = formatDateTime(announcement.createdAt),
            style = MaterialTheme.typography.bodySmall.copy(color = Color.Gray)
        )
        Spacer(modifier = Modifier.height(8.dp))
        Divider(color = Color.Gray)
    }
}
