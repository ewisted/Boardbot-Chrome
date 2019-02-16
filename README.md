# Boardbot-Chrome

<!-- # Table of Contents
- [Developer Setup](#Developer-Setup)
  - [Building the Extension](#Building-the-Extension)
  - [Installing Dev Instance in Chrome](#Installing-Dev-Instance-in-Chrome) -->

## Developer Setup

### Building the Extension
 This project uses [gulp](https://gulpjs.com/) to build the components of the application into a javascript chrome extension

 1. Navigate to the project directory and open of a command prompt window
 2. run `gulp`
 
 - You will see gulp compile two different builds, one for the Angular app and one for the content script typescript project

### Installing Dev Instance
 The build output directory holding the manifest file can be added as an extension in developer mode in its current state

1. Open the Extension Management page by navigating to chrome://extensions
    * The Extension Management page can also be opened by clicking on the Chrome menu, hovering over More Tools then selecting Extensions
2. Enable Developer Mode by clicking the toggle switch next to Developer mode
3. Click the LOAD UNPACKED button and select the dist directory
![](https://developer.chrome.com/static/images/get_started/load_extension.png "")
4. Make sure you add the build output folder. Its path should be "Boardbot-Chrome/dist/boardbot-extension"

