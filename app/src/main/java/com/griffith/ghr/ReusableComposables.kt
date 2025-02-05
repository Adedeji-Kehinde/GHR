package com.griffith.ghr

import android.net.Uri
import android.util.Log
import androidx.compose.foundation.*
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Close
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.*
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.painter.Painter
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalConfiguration
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.*
import androidx.navigation.NavController
import coil.compose.rememberAsyncImagePainter
import java.text.SimpleDateFormat
import java.util.Locale

// ------------------------- Notification Drawer Overlay -------------------------

/**
 * NotificationDrawerOverlay - Displays a dimmed overlay with a slide-in notification drawer.
 */
@Composable
fun NotificationDrawerOverlay(isNotificationDrawerOpen: MutableState<Boolean>) {
    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(Color.Black.copy(alpha = 0.5f)) // Dim background
            .clickable { isNotificationDrawerOpen.value = false } // Close drawer on tap
    ) {
        Box(
            modifier = Modifier
                .fillMaxHeight()
                .width((2 * LocalConfiguration.current.screenWidthDp / 3).dp) // 2/3 screen width
                .align(Alignment.TopEnd)
                .background(Color.White, shape = RoundedCornerShape(topStart = 16.dp, bottomStart = 16.dp)) // Rounded corners on the left
        ) {
            NotificationDrawerBox()
        }
    }
}

// ------------------------- Empty Page Message Content -------------------------

@Composable
fun EmptyPageMessage(icon: Int, message: String) {
    Column(
        modifier = Modifier.fillMaxSize(),
        verticalArrangement = Arrangement.Center,
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Icon(
            painter = painterResource(id = icon),
            contentDescription = "No Items",
            tint = Color.Gray,
            modifier = Modifier.size(48.dp) // Adjust icon size
        )

        Spacer(modifier = Modifier.height(8.dp)) // Space between icon and text

        Text(
            text = message,
            fontSize = 16.sp,
            color = Color.Gray
        )
    }
}


// ------------------------- Small Card Component -------------------------

@Composable
fun SmallCard(
    title: String,
    subtitle: String,
    icon: Painter,
    onClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    val cardHeight = LocalConfiguration.current.screenHeightDp.dp * 0.23f

    Card(
        modifier = modifier
            .fillMaxWidth()
            .height(cardHeight)
            .clickable { onClick() },
        shape = RoundedCornerShape(8.dp),
        colors = CardDefaults.cardColors(containerColor = Color.Transparent)
    ) {
        Box(modifier = Modifier.fillMaxSize()) {
            Image(
                painter = painterResource(id = R.drawable.card),
                contentDescription = "Card Background",
                contentScale = ContentScale.Crop,
                modifier = Modifier.fillMaxSize()
            )

            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(16.dp),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Image(painter = icon, contentDescription = "Card Icon", modifier = Modifier.size(40.dp))
                Spacer(modifier = Modifier.height(8.dp))
                Text(text = title, fontSize = 16.sp, fontWeight = FontWeight.Bold, color = Color.Black)
                if (subtitle.isNotEmpty()) {
                    Text(text = subtitle, fontSize = 12.sp, color = Color.Black)
                }
            }
        }
    }
}

// ------------------------- Large Card Component -------------------------

@Composable
fun LargeCard(
    title: String,
    subtitle: String,
    icon: Painter,
    onClick: () -> Unit
) {
    val cardHeight = LocalConfiguration.current.screenHeightDp.dp * 0.22f

    Card(
        modifier = Modifier
            .fillMaxWidth()
            .height(cardHeight)
            .clickable { onClick() },
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = Color.Transparent)
    ) {
        Box(modifier = Modifier.fillMaxSize()) {
            Image(
                painter = painterResource(id = R.drawable.card),
                contentDescription = "Card Background",
                contentScale = ContentScale.Crop,
                modifier = Modifier.fillMaxSize()
            )

            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(16.dp),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Image(painter = icon, contentDescription = "Card Icon", modifier = Modifier.size(50.dp))
                Spacer(modifier = Modifier.height(8.dp))
                Text(text = title, fontSize = 20.sp, fontWeight = FontWeight.Bold, color = Color.Black)
                if (subtitle.isNotEmpty()) {
                    Text(text = subtitle, fontSize = 14.sp, color = Color.Black)
                }
            }
        }
    }
}

// ------------------------- Footer Button Component -------------------------

@Composable
fun FooterButton(navController: NavController, buttonText: String, navigateTo: String) {
    Box(modifier = Modifier.fillMaxWidth().padding(16.dp), contentAlignment = Alignment.Center) {
        Button(
            onClick = { navController.navigate(navigateTo) },
            colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.primary),
            modifier = Modifier.wrapContentWidth()
        ) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Icon(imageVector = Icons.Default.Add, contentDescription = "Add", tint = Color.White)
                Spacer(modifier = Modifier.width(8.dp))
                Text(text = buttonText, color = Color.White, style = MaterialTheme.typography.bodyLarge, maxLines = 1)
            }
        }
    }
}

// ------------------------- Formatted Date Component -------------------------

/**
 * formatDateTime - Formats the provided date string to a readable format.
 */
fun formatDateTime(dateTimeString: String): String {
    return try {
        val inputFormat = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", Locale.getDefault())
        val outputFormat = SimpleDateFormat("EEE, dd MMM yyyy, HH:mm", Locale.getDefault())
        val date = inputFormat.parse(dateTimeString)
        if (date != null) outputFormat.format(date) else "-"
    } catch (e: Exception) {
        Log.e("DateFormattingError", "Error formatting date: ${e.message}", e)
        "-"
    }
}

// ------------------------- REUSABLE STATUS BADGE -------------------------

/**
 * StatusBadge - A reusable Composable to display status labels.
 */
@Composable
fun StatusBadge(status: String?) {
    val backgroundColor = when (status) {
        "Pending" -> Color.Blue
        "In Process" -> Color.Blue
        "Resolved" -> Color.Green
        "Completed" -> Color.Green
        "To Collect" -> Color.Blue
        "Collected" -> Color.Green
        "Cancelled" -> Color.Red
        else -> Color.Gray
    }
    Box(
        modifier = Modifier
            .background(backgroundColor, shape = RoundedCornerShape(16.dp))
            .padding(horizontal = 16.dp, vertical = 8.dp)
    ) {
        Text(text = status ?: "-", fontSize = 14.sp, fontWeight = FontWeight.Bold, color = Color.White)
    }
}

// ------------------------- Dropdown Component -------------------------

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun Dropdown(label: String, options: List<String>, onOptionSelected: (String) -> Unit) {
    val showBottomDrawer = remember { mutableStateOf(false) }
    val selectedOption = remember { mutableStateOf("") }

    Box(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 8.dp)
            .border(1.dp, Color.Gray, RoundedCornerShape(4.dp))
            .background(MaterialTheme.colorScheme.surface, shape = RoundedCornerShape(8.dp))
            .clickable { showBottomDrawer.value = true }
            .padding(16.dp)
    ) {
        Text(
            text = selectedOption.value.ifEmpty { label },
            color = if (selectedOption.value.isEmpty()) Color.Gray else Color.Black,
            fontSize = 16.sp
        )
    }

    if (showBottomDrawer.value) {
        ModalBottomSheet(
            onDismissRequest = { showBottomDrawer.value = false },
            sheetState = rememberModalBottomSheetState(skipPartiallyExpanded = true),
            shape = RoundedCornerShape(topStart = 16.dp, topEnd = 16.dp)
        ) {
            Column(modifier = Modifier.fillMaxWidth().padding(16.dp)) {
                Text(text = "Select an Option", fontWeight = FontWeight.Bold, fontSize = 18.sp)
                options.forEach { option ->
                    Text(
                        text = option,
                        fontSize = 16.sp,
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(vertical = 8.dp)
                            .clickable {
                                selectedOption.value = option
                                onOptionSelected(option)
                                showBottomDrawer.value = false
                            }
                    )
                }
            }
        }
    }
}

// ------------------------- TextBox Component -------------------------

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun TextBox(label: String, onTextChange: (String) -> Unit) {
    val text = remember { mutableStateOf("") }
    val maxLength = 100

    Column {
        Text(text = label, fontSize = 16.sp, color = Color.Black)
        OutlinedTextField(
            value = text.value,
            onValueChange = {
                if (it.length <= maxLength) {
                    text.value = it
                    onTextChange(it)
                }
            },
            modifier = Modifier.fillMaxWidth().background(Color.White, shape = RoundedCornerShape(8.dp)),
            shape = RoundedCornerShape(8.dp),
            colors = TextFieldDefaults.outlinedTextFieldColors(
                focusedBorderColor = MaterialTheme.colorScheme.primary,
                unfocusedBorderColor = Color.Gray
            )
        )
        Text(text = "${text.value.length} / $maxLength", fontSize = 12.sp, color = Color.Gray)
    }
}

// ------------------------- Upload Image Box Component -------------------------

@Composable
fun UploadImageBox(size: Dp, onClick: () -> Unit) {
    Box(
        modifier = Modifier.size(size).background(Color.LightGray, shape = RoundedCornerShape(8.dp)).clickable { onClick() },
        contentAlignment = Alignment.Center
    ) {
        Image(painter = rememberAsyncImagePainter(R.drawable.upload), contentDescription = "Upload Image", contentScale = ContentScale.Fit, modifier = Modifier.size(size / 2))
    }
}

// ------------------------- Image Box Component -------------------------

@Composable
fun ImageBox(uri: Uri, size: Dp, onRemove: () -> Unit, onExpand: () -> Unit) {
    Box(
        modifier = Modifier.size(size).background(Color.Gray, shape = RoundedCornerShape(8.dp)).clickable { onExpand() }
    ) {
        Image(painter = rememberAsyncImagePainter(uri), contentDescription = null, contentScale = ContentScale.Crop, modifier = Modifier.fillMaxSize())
        IconButton(onClick = { onRemove() }, modifier = Modifier.align(Alignment.TopEnd).background(Color.Black.copy(alpha = 0.7f), shape = CircleShape).size(24.dp)) {
            Icon(imageVector = Icons.Default.Close, contentDescription = "Remove Image", tint = Color.White)
        }
    }
}

// ------------------------- User Details Row Component -------------------------

@Composable
fun UserDetailRow(label: String, detail: String) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 8.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        // Label on the left
        Text(
            text = label,
            fontSize = 16.sp,
            color = MaterialTheme.colorScheme.onBackground,
            modifier = Modifier.weight(1f)
        )

        // Detail on the right
        Text(
            text = detail,
            fontSize = 16.sp,
            fontWeight = FontWeight.Bold,
            color = MaterialTheme.colorScheme.onBackground,
            modifier = Modifier.weight(1f),
            textAlign = androidx.compose.ui.text.style.TextAlign.End
        )
    }
}

