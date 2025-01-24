package com.griffith.ghr

import android.content.Context
import android.util.Log
import android.widget.Toast
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalConfiguration
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.navigation.NavController
import kotlinx.coroutines.launch
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import retrofit2.http.GET
import retrofit2.http.Header

// Data class for user details
data class UserProfile(
    val name: String,
    val lastName: String,
    val gender: String,
    val email: String,
    val phone: String? = null
)

// Retrofit API interface
interface UserProfileApi {
    @GET("api/auth/user")
    suspend fun getUserProfile(@Header("Authorization") token: String): UserProfile
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun UserProfilePage(navController: NavController) {
    val scope = rememberCoroutineScope()
    val context = LocalContext.current

    // State for menu drawer
    val menuDrawerState = rememberDrawerState(DrawerValue.Closed)
    val isNotificationDrawerOpen = remember { mutableStateOf(false) }

    // State for user profile details
    var userName by remember { mutableStateOf("Loading...") }
    var userGender by remember { mutableStateOf("Loading...") }
    var userEmail by remember { mutableStateOf("Loading...") }
    var userPhone by remember { mutableStateOf("Loading...") }

    // Initialize Retrofit
    val retrofit = remember {
        Retrofit.Builder()
            .baseUrl("https://ghr-1.onrender.com")
            .addConverterFactory(GsonConverterFactory.create())
            .build()
    }

    val userProfileApi = retrofit.create(UserProfileApi::class.java)

    // Fetch user profile on first composition
    LaunchedEffect(Unit) {
        val sharedPreferences = context.getSharedPreferences("AppPrefs", Context.MODE_PRIVATE)
        val token = sharedPreferences.getString("authToken", null)

        if (token != null) {
            scope.launch {
                try {
                    val userProfile = userProfileApi.getUserProfile("Bearer $token")
                    userName = "${userProfile.name} ${userProfile.lastName}"
                    userGender = userProfile.gender
                    userEmail = userProfile.email
                    userPhone = userProfile.phone ?: "Not Provided"
                } catch (e: Exception) {
                    Log.e("UserProfilePage", "Error fetching user profile", e)
                    Toast.makeText(
                        context,
                        "Failed to fetch profile. Please try again.",
                        Toast.LENGTH_LONG
                    ).show()
                }
            }
        } else {
            Toast.makeText(
                context,
                "No authentication token found. Please log in again.",
                Toast.LENGTH_LONG
            ).show()
        }
    }

    Box(modifier = Modifier.fillMaxSize()) {
        ModalNavigationDrawer(
            drawerState = menuDrawerState,
            drawerContent = {
                ModalDrawerSheet {
                    MenuDrawerContent(navController = navController)
                }
            },
            modifier = Modifier.fillMaxSize()
        ) {
            Scaffold(
                topBar = {
                    AppHeader(
                        onMenuClick = {
                            scope.launch { menuDrawerState.open() }
                        },
                        onNotificationClick = {
                            isNotificationDrawerOpen.value = true
                        },
                        navController = navController,
                        showBackButton = true
                    )
                },
                content = { innerPadding ->
                    Column(
                        modifier = Modifier
                            .fillMaxSize()
                            .padding(innerPadding)
                            .padding(16.dp),
                        verticalArrangement = Arrangement.Top,
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        // Profile Image
                        Box(
                            modifier = Modifier
                                .size(120.dp)
                                .background(Color.Gray, shape = CircleShape),
                            contentAlignment = Alignment.Center
                        ) {
                            Image(
                                painter = painterResource(id = R.drawable.app_logo),
                                contentDescription = "Profile Image",
                                modifier = Modifier
                                    .size(120.dp)
                                    .clip(CircleShape)
                            )
                        }

                        Spacer(modifier = Modifier.height(16.dp))

                        // User Name
                        Text(
                            text = userName,
                            fontSize = 24.sp,
                            fontWeight = FontWeight.Bold,
                            color = MaterialTheme.colorScheme.onBackground
                        )

                        Spacer(modifier = Modifier.height(32.dp))

                        // User Details Box
                        Box(
                            modifier = Modifier
                                .fillMaxWidth()
                                .background(
                                    color = MaterialTheme.colorScheme.surface,
                                    shape = RoundedCornerShape(16.dp)
                                )
                                .border(1.dp, Color.Black, RoundedCornerShape(16.dp))
                                .padding(16.dp)
                        ) {
                            Column {
                                UserDetailRow(label = "Gender", detail = userGender)
                                HorizontalDivider(color = Color.Gray, thickness = 0.5.dp)
                                UserDetailRow(label = "Email", detail = userEmail)
                                HorizontalDivider(color = Color.Gray, thickness = 0.5.dp)
                                UserDetailRow(label = "Phone", detail = userPhone)
                            }
                        }
                    }
                }
            )
        }

        if (isNotificationDrawerOpen.value) {
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .background(Color.Black.copy(alpha = 0.5f))
                    .clickable { isNotificationDrawerOpen.value = false }
            )
            Box(
                modifier = Modifier
                    .fillMaxHeight()
                    .width((2 * LocalConfiguration.current.screenWidthDp / 3).dp)
                    .align(Alignment.TopEnd)
                    .background(Color.White, shape = RoundedCornerShape(topStart = 16.dp, bottomStart = 16.dp))
            ) {
                NotificationDrawerBox()
            }
        }
    }
}