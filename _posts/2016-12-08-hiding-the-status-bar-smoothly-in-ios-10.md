---
layout: post
title: Hiding the Status Bar smoothly in iOS 10 with Swift
categories: swift, ios
---
The status bar. It's one of the most important parts of the user interface on mobile devices because it contains vital informations like network status, carrier informations or the battery status. 

For that reason Apple recommends not to hide the status permanently [in their Human Interface Guidelines](https://developer.apple.com/ios/human-interface-guidelines/ui-bars/status-bars/).

However sometimes we just want to hide it - mostly for aesthetic reasons. Be it a nice, simple login screen, a modal where a status bar with all its informations just wouldn't fit or when displaying full-screen media like photos or videos.

## Starter project

**Note:** This tutorial was created using Xcode 8.1 and Swift 3.

Let's get started by downloading the starter project here:
[Project files at GitHub](https://github.com/helmrich/HidingStatusBar)

Open the Xcode project inside the `HidingStatusBarStart` folder. You should have the following project structure:

![Folder Structure](https://github.com/helmrich/helmrich.github.io/blob/master/assets/images/FolderStructure.jpg?raw=true)

The only files that are important for now are:

* **`InitialViewController.swift`:** The view controller that controls the view we can see in the beginning. It contains a button which lets us present the modal view controller.
* **`ModalViewController.swift`:** This view controller controls the modal view we present by tapping the button in the initial view controller. We can dismiss this view controller by tapping the button in the center.
* **`Info.plist`**

Let's run the project in the simulator and see how it looks...

![First Run of the Project](https://github.com/helmrich/helmrich.github.io/blob/master/assets/images/FirstRun.gif?raw=true)

Alright. Nothing too fancy here. We can both present and dismiss the modal view controller. But as we can see the status bar is there permanently. We just want the status bar to be visible on the initial view controller but we want to hide it on the modal view controller.

So let's start by simply hiding the status bar.

## Hiding the status bar

There are multiple ways on how to hide the status bar in iOS 10. One way would be to check the `Hide status bar` checkbox in the project settings.

![Project Settings for hiding the Status Bar](https://github.com/helmrich/helmrich.github.io/blob/master/assets/images/HideStatusBarProjectSettings.jpg?raw=true)

That's fine if we want to hide the status bar *permanently* on all view controllers. However to have more fine-grained control we should do it in code. But no worries, it's almost as easy as checking a checkbox.

But before we start coding we have to do some preparation. Navigate to the `Info.plist` file, hover over the bottommost key in the Plist and click the plus icon. Now add the `View controller-based status bar appearance` key and set its value to `YES`.

![View Controller Based Status Bar Appearance Key](https://github.com/helmrich/helmrich.github.io/blob/master/assets/images/ViewControllerBasedKey.png?raw=true)

Like the name implies, setting this key's value to `YES` allows us to control the appearance of the status bar in every view controller.

So let's dive into code and hide the status bar where we don't want to see it - the modal view controller.

In order to hide the status bar on a view controller we have to override the [`prefersStatusBarHidden`](https://developer.apple.com/reference/uikit/uiviewcontroller/1621440-prefersstatusbarhidden) property.

Add the following code to the top of our modal view controller:

```swift
override var prefersStatusBarHidden: Bool {
    return true
}
```

Let's see if that works by running the project...

![Choppy hidden status bar](https://github.com/helmrich/helmrich.github.io/blob/master/assets/images/ChoppyHiddenStatusBar.gif?raw=true)

Great! The status bar is now hidden on the modal view controller. But... something feels wrong, doesn't it?

## Problems when hiding the status bar

That's not what we want, right? The status bar is hidden before the modal view controller is even fully visible and it shows immediately when it's dismissed. 

It looks choppy and not at all pleasing. It almost implies that something is wrong with the status bar and that hiding it is not even intentional.

What we want is a smooth and subtle way to hide the status bar. Let's find out how to achieve this.

## Hiding the status bar smoothly

### Preparation

If we think about it, the actual hiding of the status bar should happen in the presenting view controller - in this case the initial view controller. The modal view controller doesn't have a status bar to begin with because we set its `prefersStatusBarHidden` value to `true`.

This means we should go to the initial view controller and continue coding there.

At first, a property should be added to store whether the status bar should be hidden or not. This will be important later on, when we want to hide or display the status bar. Then we can use this property's value when we override the `prefersStatusBarHidden` property again instead of just hardcoding a value there.

For the modal this was okay, because it should *always* be hidden there. Here on the other hand `prefersStatusBarHidden`'s value should be dynamic, as it should be possible to change it on certain occasions (e.g. when presenting a modal).

Create the property in the initial view controller and give it an initial value of `false`. Then override the `prefersStatusBarHidden` property, but this time using `statusBarShouldBeHidden`'s value.

```swift
var statusBarShouldBeHidden = false

override var prefersStatusBarHidden: Bool {
    return statusBarShouldBeHidden
}
```

Okay. So that was almost the same like before and if you run the project you'll see everything is the same - as expected - because `statusBarShouldBeHidden`'s value is `false` and we didn't change it yet. Let's do this now.

### Changing the status bar appearance

We want to start changing the status bar's appearance right before presenting the modal so that both animations - hiding the status bar and sliding in the modal - will seem like they belong together and create one smooth animation.

To begin with, let's change `statusBarShouldBeHidden`'s value to `true`. But that by itself doesn't change anything yet. We have to find a way to tell the system that a status bar's attribute has changed...

[`setNeedsStatusBarAppearanceUpdate()`](https://developer.apple.com/reference/uikit/uiviewcontroller/1621354-setneedsstatusbarappearanceupdat) to the rescue! 🎉 This function does just that: It tells the system that the status bar attributes have changed. Add the following code right before presenting the modal view controller:

```swift
statusBarShouldBeHidden = true
setNeedsStatusBarAppearanceUpdate()
```

So far so good.

If we run the project we'll see that... nothing changed. 🙁 Why? Well, we want an animation, right? So if we search through the documentation we can find a property called [`preferredStatusBarUpdateAnimation`](https://developer.apple.com/reference/uikit/uiviewcontroller/1621434-preferredstatusbarupdateanimatio) which is of type [`UIStatusBarAnimation`](https://developer.apple.com/reference/uikit/uistatusbaranimation). 

`UIStatusBarAnimation` comes with three different values:

* `none`
* `fade`
* `slide`

In this case `slide` is probably the best choice as the modal is also slid in, but feel free to use `fade` (which is the default value, so you don't have to overwrite `preferredStatusBarUpdateAnimation` in this case) if you want to.

Override the property like so:

```swift
override var preferredStatusBarUpdateAnimation: UIStatusBarAnimation {
    return .slide
}
```

Run the project once again and... nothing changed *again*? Don't worry, there is only *one* tiny piece missing to complete the puzzle.

If we further explore [the documentation page for `setNeedsStatusBarAppearanceUpdate()`](https://developer.apple.com/reference/uikit/uiviewcontroller/1621354-setneedsstatusbarappearanceupdat) we can see this important sentence: 

>If you call this method within an animation block, the changes are animated along with the rest of the animation block.

That means if we use an animation method on `UIView` and call `setNeedsStatusBarAppearance()` in its trailing closure it will be animated with the specified animation parameters. Perfect! Let's create an animation by using `UIView`'s `animate(withDuration:animations:)` method and call the `setNeedsStatusBarAppearance()` method in it.

The final `presentModal` action should look similar to this:

```swift
@IBAction func presentModal(_ sender: Any) {
    // Instantiate the modal view controller from storyboard
    let modalViewController = storyboard?.instantiateViewController(withIdentifier: "ModalViewController") as! ModalViewController
    
    // Hide the status bar
    statusBarShouldBeHidden = true
    UIView.animate(withDuration: 0.25) {
        self.setNeedsStatusBarAppearanceUpdate()
    }
    
    // Present the modal view controller
    present(modalViewController, animated: true, completion: nil)
}
```

Run the project and you'll see that it's finally working! 🎉 Good job!

## Showing the status bar again

The last thing that's left to do is showing the status bar again when the modal is dismissed.

To do this you can use the same code like before but instead of setting `statusBarShouldBeHidden` to `true` you set it to `false` and add it to the initial view controller's `viewWillAppear` method, like so:

```swift
override func viewWillAppear(_ animated: Bool) {
    super.viewWillAppear(animated)
    
    // Show the status bar
    statusBarShouldBeHidden = false
    UIView.animate(withDuration: 0.25) {
        self.setNeedsStatusBarAppearanceUpdate()
    }
}
```

Et voilà, that looks much better!

![Final Run of the Project](https://github.com/helmrich/helmrich.github.io/blob/master/assets/images/FinalRun.gif?raw=true)