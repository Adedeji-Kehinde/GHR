package com.griffith.ghr

import android.content.Context
import android.util.Log
import android.widget.Toast
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.navigation.NavController
import coil.compose.rememberAsyncImagePainter
import coil.request.ImageRequest
import kotlinx.coroutines.launch
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory

// ------------------------- USER PROFILE PAGE -------------------------

/**
 * UserProfilePage - Displays the user's details and displays profile picture.
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun UserProfilePage(navController: NavController) {
    val scope = rememberCoroutineScope()
    val context = LocalContext.current

    // Drawer States
    val menuDrawerState = rememberDrawerState(DrawerValue.Closed)
    val isNotificationDrawerOpen = remember { mutableStateOf(false) }

    //  States for user profile details
    var userName by remember { mutableStateOf("Loading...") }
    var userGender by remember { mutableStateOf("Loading...") }
    var userEmail by remember { mutableStateOf("Loading...") }
    var userPhone by remember { mutableStateOf("Loading...") }
    var profileImageUrl by remember { mutableStateOf("") }

    //  Initialize Retrofit
    val retrofit = remember {
        Retrofit.Builder()
            .baseUrl("https://ghr-1.onrender.com")
            .addConverterFactory(GsonConverterFactory.create())
            .build()
    }
    val userProfileApi = retrofit.create(UserProfileApi::class.java)

    //  Fetch user profile data on launch
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
                    profileImageUrl = userProfile.profileImageUrl ?: ""
                } catch (e: Exception) {
                    Log.e("UserProfilePage", "Error fetching user profile", e)
                    Toast.makeText(context, "Failed to fetch profile. Please try again.", Toast.LENGTH_LONG).show()
                }
            }
        } else {
            Toast.makeText(context, "No authentication token found. Please log in again.", Toast.LENGTH_LONG).show()
        }
    }

    //  Layout of the Profile Page
    Box(modifier = Modifier.fillMaxSize()) {
        //  Navigation Drawer
        ModalNavigationDrawer(
            drawerState = menuDrawerState,
            drawerContent = { ModalDrawerSheet { MenuDrawerContent(navController = navController) } },
            modifier = Modifier.fillMaxSize()
        ) {
            //  Scaffold with Top Bar
            Scaffold(
                topBar = {
                    AppHeader(
                        onMenuClick = { scope.launch { menuDrawerState.open() } },
                        onNotificationClick = { isNotificationDrawerOpen.value = true },
                        navController = navController,
                        showBackButton = true
                    )
                },
                content = { innerPadding ->
                    Column(
                        modifier = Modifier.fillMaxSize().padding(innerPadding).padding(16.dp),
                        verticalArrangement = Arrangement.Top,
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        //  Profile Image
                        ProfileImage(profileImageUrl)
                        Spacer(modifier = Modifier.height(16.dp))

                        //  User Name
                        Text(text = userName, fontSize = 24.sp, fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.onBackground)
                        Spacer(modifier = Modifier.height(32.dp))

                        //  User Details Section
                        UserDetailsSection(userGender, userEmail, userPhone)
                    }
                }
            )
        }
    }
}

// ------------------------- DELIVERIES PAGE CONTENT -------------------------

/**
 * ProfileImage - Composable for displaying the user's profile image.
 */
@Composable
fun ProfileImage(profileImageUrl: String) {
    Box(
        modifier = Modifier.size(120.dp).clip(CircleShape).border(2.dp, Color.Gray, CircleShape),
        contentAlignment = Alignment.Center
    ) {
        Image(
            painter = rememberAsyncImagePainter(
                ImageRequest.Builder(LocalContext.current)
                    .data(profileImageUrl.ifEmpty { "https://res.cloudinary.com/dxlrv28eb/user_profiles/default_Image.JPG" }) // Fallback image
                    .crossfade(true)
                    .build()
            ),
            contentDescription = "Profile Image",
            modifier = Modifier.size(120.dp).clip(CircleShape),
            contentScale = ContentScale.Crop
        )
    }
}

// ------------------------- DELIVERIES PAGE CONTENT -------------------------

/**
 * UserDetailsSetion - Composable for displaying user details section.
 */
@Composable
fun UserDetailsSection(gender: String, email: String, phone: String) {
    Box(
        modifier = Modifier.fillMaxWidth()
            .background(
                color = MaterialTheme.colorScheme.surface,
                shape = RoundedCornerShape(16.dp)
            )
            .border(1.dp, color = MaterialTheme.colorScheme.onBackground, RoundedCornerShape(16.dp))
            .padding(16.dp)
    ) {
        Column {
            UserDetailRow(label = "Gender", detail = gender)
            HorizontalDivider(color = Color.Gray, thickness = 0.5.dp)
            UserDetailRow(label = "Email", detail = email)
            HorizontalDivider(color = Color.Gray, thickness = 0.5.dp)
            UserDetailRow(label = "Phone", detail = phone)
        }
    }
}

