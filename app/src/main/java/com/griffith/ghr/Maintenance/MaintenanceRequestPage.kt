package com.griffith.ghr

import android.content.Context
import android.net.Uri
import android.provider.OpenableColumns
import android.widget.Toast
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Button
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.DrawerValue
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.ModalDrawerSheet
import androidx.compose.material3.ModalNavigationDrawer
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.rememberDrawerState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateListOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalConfiguration
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import androidx.navigation.NavController
import coil.compose.rememberAsyncImagePainter
import kotlinx.coroutines.launch
import okhttp3.MediaType.Companion.toMediaTypeOrNull
import okhttp3.MultipartBody
import okhttp3.RequestBody
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import java.io.InputStream


// ------------------------- MAINTENANCE REQUEST PAGE -------------------------

@Composable
fun MaintenanceRequestPage(navController: NavController) {
    val scope = rememberCoroutineScope()

    // Drawer States
    val menuDrawerState = rememberDrawerState(DrawerValue.Closed)
    val isNotificationDrawerOpen = remember { mutableStateOf(false) }

    Box(modifier = Modifier.fillMaxSize().background(Color.White)) {
        ModalNavigationDrawer(
            drawerState = menuDrawerState,
            drawerContent = { ModalDrawerSheet { MenuDrawerContent(navController = navController) } },
            modifier = Modifier.fillMaxSize()
        ) {
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
                    MaintenanceRequestContent(innerPadding = innerPadding, navController = navController)
                }
            )
        }
    }
}

@Composable
fun MaintenanceRequestContent(innerPadding: PaddingValues, navController: NavController) {
    val context = LocalContext.current
    val scope = rememberCoroutineScope()

    // Retrofit setup
    val retrofit = remember {
        Retrofit.Builder()
            .baseUrl("https://ghr-1.onrender.com")
            .addConverterFactory(GsonConverterFactory.create())
            .build()
    }
    val userProfileApi = retrofit.create(UserProfileApi::class.java)
    val maintenanceRequestApi = retrofit.create(MaintenanceRequestApi::class.java)

    // State Variables
    var roomNumber by remember { mutableStateOf("") }
    val category = remember { mutableStateOf("") }
    val description = remember { mutableStateOf("") }
    val roomAccess = remember { mutableStateOf("") }
    val selectedImages = remember { mutableStateListOf<Uri>() }
    val imageSize = ( LocalConfiguration.current.screenWidthDp.dp - 24.dp) / 2 // Adjust size to fit two images per row with spacing
    val isImageExpanded = remember { mutableStateOf<Uri?>(null) }
    val isSubmitting = remember { mutableStateOf(false) }

    val launcher = rememberLauncherForActivityResult(ActivityResultContracts.GetContent()) { uri: Uri? ->
        uri?.let { if (selectedImages.size < 5) selectedImages.add(it) }
    }
    // Fetch user's room number
    LaunchedEffect(Unit) {
        val sharedPreferences = context.getSharedPreferences("AppPrefs", Context.MODE_PRIVATE)
        val token = sharedPreferences.getString("authToken", null)

        if (token != null) {
            try {
                val userProfile = userProfileApi.getUserProfile("Bearer $token")
                roomNumber = userProfile.roomNumber
            } catch (e: Exception) {
                println("Error fetching user profile: ${e.message}")
            }
        }
    }

    Box(
        modifier = Modifier.fillMaxSize().padding(innerPadding).padding(16.dp)
    ) {
        Column(
            modifier = Modifier.fillMaxSize().verticalScroll(rememberScrollState())
        ) {
            Text(text = "Maintenance Request", fontSize = 24.sp, fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.onBackground)
            Spacer(modifier = Modifier.height(8.dp))

            // Placeholder subtitle
            Text(text = "Our team is available during office hours. For weekend emergencies, please reach out to our hotline. Thank you for your understanding.", fontSize = 14.sp, color = Color.Gray)
            Spacer(modifier = Modifier.height(16.dp))

            // Horizontal divider
            HorizontalDivider(color = Color.Gray, thickness = 1.dp)
            Spacer(modifier = Modifier.height(16.dp))

            // Display Room Number
            Text(text = "Room Allocation", fontSize = 18.sp, fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.onBackground)
            Spacer(modifier = Modifier.height(8.dp))
            
            Dropdown(
                label = "Select Room",
                options = listOf(roomNumber),
                onOptionSelected = { selectedRoom ->
                    roomNumber = selectedRoom
                }
            )
            Spacer(modifier = Modifier.height(16.dp))

            // Maintenance Category
            Text(text = "Maintenance Category", fontSize = 18.sp, fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.onBackground)
            Spacer(modifier = Modifier.height(8.dp))
            
            Dropdown(
                label = "Select Category",
                options = listOf(
                    "Appliances",
                    "Cleaning",
                    "Plumbing & Leaking",
                    "Heating",
                    "Lighting",
                    "Windows & Doors",
                    "Furniture & Fitting",
                    "Flooring",
                    "Other"
                ),
                onOptionSelected = { category.value = it }
            )
            Spacer(modifier = Modifier.height(16.dp))

            // Description
            Text(text = "Description", fontSize = 18.sp, fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.onBackground)
            Spacer(modifier = Modifier.height(8.dp))
            
            TextBox(
                label = "Enter a brief description of the issue",
                onTextChange = { description.value = it }
            )
            Spacer(modifier = Modifier.height(16.dp))

            // May we enter your room when you're away?
            Text(text = "May we enter your room when you're away?", fontSize = 18.sp, fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.onBackground)
            Spacer(modifier = Modifier.height(8.dp))
            
            Dropdown(
                label = "Select Option",
                options = listOf("Yes", "No"), // Placeholder options
                onOptionSelected = { roomAccess.value = it }
            )
            Spacer(modifier = Modifier.height(16.dp))

            // Pictures Section
            Text(text = "Pictures", fontSize = 18.sp, fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.onBackground)
            Spacer(modifier = Modifier.height(8.dp))
            
            Text(text = "Upload Images (5 Max)", fontSize = 14.sp, color = Color.Gray)

            Spacer(modifier = Modifier.height(16.dp))

            // Display Images with Upload Icon
            for (rowIndex in 0..(selectedImages.size / 2)) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(8.dp) // Spacing between images
                ) {
                    val firstIndex = rowIndex * 2
                    if (firstIndex < selectedImages.size) {
                        ImageBox(
                            uri = selectedImages[firstIndex],
                            size = imageSize,
                            onRemove = { selectedImages.removeAt(firstIndex) },
                            onExpand = { isImageExpanded.value = selectedImages[firstIndex] }
                        )
                    }

                    val secondIndex = firstIndex + 1
                    if (secondIndex < selectedImages.size) {
                        ImageBox(
                            uri = selectedImages[secondIndex],
                            size = imageSize,
                            onRemove = { selectedImages.removeAt(secondIndex) },
                            onExpand = { isImageExpanded.value = selectedImages[secondIndex] }
                        )
                    } else if (selectedImages.size < 3) {
                        // Upload Image Icon Box
                        UploadImageBox(
                            size = imageSize,
                            onClick = { launcher.launch("image/*") }
                        )
                    }
                }
                Spacer(modifier = Modifier.height(8.dp))
            }
            Spacer(modifier = Modifier.height(16.dp))

            // Full-Screen Image View
            isImageExpanded.value?.let { expandedUri ->
                Dialog(onDismissRequest = { isImageExpanded.value = null }) {
                    Box(
                        modifier = Modifier.fillMaxSize().background(Color.Black)
                    ) {
                        Image(
                            painter = rememberAsyncImagePainter(expandedUri),
                            contentDescription = null,
                            contentScale = ContentScale.Fit,
                            modifier = Modifier.fillMaxSize().clickable { isImageExpanded.value = null }
                        )
                    }
                }
            }
            Spacer(modifier = Modifier.height(16.dp))
            // Submit Button
            Button(
                onClick = {
                    scope.launch {
                        isSubmitting.value = true
                        try {
                            val sharedPreferences = context.getSharedPreferences("AppPrefs", Context.MODE_PRIVATE)
                            val token = sharedPreferences.getString("authToken", null)

                            val imagesParts = selectedImages.map { uri ->
                                uriToMultipartBody(context, uri)
                            }
                            maintenanceRequestApi.createMaintenanceRequest(
                                token = "Bearer $token",
                                roomNumber = RequestBody.create("text/plain".toMediaTypeOrNull(), roomNumber),
                                category = RequestBody.create("text/plain".toMediaTypeOrNull(), category.value),
                                description = RequestBody.create("text/plain".toMediaTypeOrNull(), description.value),
                                roomAccess = RequestBody.create("text/plain".toMediaTypeOrNull(), roomAccess.value),
                                images = imagesParts
                            )
                            // Show Success Toast
                            Toast.makeText(context, "Request submitted successfully!", Toast.LENGTH_LONG).show()
                            navController.navigate("MaintenancePage")
                        } catch (e: Exception) {
                            Toast.makeText(context, "Error: ${e.message}", Toast.LENGTH_LONG).show()
                        } finally {
                            isSubmitting.value = false
                        }
                    }
                },
                enabled = !isSubmitting.value,
                modifier = Modifier.fillMaxWidth()
            ) {
                if (isSubmitting.value) {
                    CircularProgressIndicator(color = Color.White, modifier = Modifier.size(24.dp))
                } else {
                    Text("Submit Request")
                }
            }
        }
    }
}


// Function to Convert URI to MultipartBody.Part
fun uriToMultipartBody(context: Context, uri: Uri): MultipartBody.Part {
    val contentResolver = context.contentResolver
    val inputStream: InputStream? = contentResolver.openInputStream(uri)
    val fileName = getFileName(context, uri)

    val requestBody = inputStream?.readBytes()?.let { bytes ->
        RequestBody.create(contentResolver.getType(uri)?.toMediaTypeOrNull() ?: "image/*".toMediaTypeOrNull(), bytes)
    } ?: throw IllegalStateException("Failed to read input stream")

    return MultipartBody.Part.createFormData("images", fileName, requestBody)
}

// Function to Get File Name from URI
fun getFileName(context: Context, uri: Uri): String {
    var result: String? = null
    if (uri.scheme == "content") {
        val cursor = context.contentResolver.query(uri, null, null, null, null)
        try {
            if (cursor != null && cursor.moveToFirst()) {
                val index = cursor.getColumnIndex(OpenableColumns.DISPLAY_NAME)
                if (index >= 0) {
                    result = cursor.getString(index)
                }
            }
        } finally {
            cursor?.close()
        }
    }
    return result ?: "image_${System.currentTimeMillis()}.jpg"
}