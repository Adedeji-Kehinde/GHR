package com.griffith.ghr

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import com.griffith.ghr.ui.theme.GHRTheme

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            GHRTheme {
                NavGraph()
            }
        }
    }
}
