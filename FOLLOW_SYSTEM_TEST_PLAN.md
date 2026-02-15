# Follow/Unfollow System - Test Plan

## Overview
This document outlines the comprehensive testing plan for the follow/unfollow system implemented in the React Native social media app.

## Firestore Data Structure Verification

### Users Collection Enhancement
- [ ] Verify that user profiles include `followersCount` and `followingCount` fields
- [ ] Ensure default values are set to 0 for new users
- [ ] Confirm existing users are properly migrated to include these fields

### Followers Subcollection
- [ ] Verify that following a user creates a document in `/users/{targetUserId}/followers/{currentUserId}`
- [ ] Confirm document contains correct fields: `userId`, `followerId`, `followedAt`
- [ ] Test that document is properly indexed and queryable

### Following Subcollection
- [ ] Verify that following a user creates a document in `/users/{currentUserId}/following/{targetUserId}`
- [ ] Confirm document contains correct fields: `userId`, `followedId`, `followedAt`
- [ ] Test that document is properly indexed and queryable

## Service Functions Testing

### followUser Function
- [ ] Verify successful follow operation
- [ ] Confirm two documents are created (in both subcollections)
- [ ] Check that follower/following counts are incremented atomically
- [ ] Test error handling for self-follow attempts
- [ ] Verify error handling for already-following scenarios
- [ ] Confirm proper error propagation to UI layer

### unfollowUser Function
- [ ] Verify successful unfollow operation
- [ ] Confirm two documents are deleted (from both subcollections)
- [ ] Check that follower/following counts are decremented atomically
- [ ] Test error handling for not-following scenarios
- [ ] Confirm proper error propagation to UI layer

### checkFollowingStatus Function
- [ ] Verify accurate return of following status
- [ ] Test with both following and non-following scenarios
- [ ] Confirm proper error handling when user is not authenticated

### getFollowers/getFollowing Functions
- [ ] Verify accurate retrieval of follower/following lists
- [ ] Test pagination functionality with `limit` and `lastVisible` parameters
- [ ] Confirm user profile information is properly enriched in results
- [ ] Test with empty follower/following lists

### getPostsFromFollowedUsers Function
- [ ] Verify accurate retrieval of posts from followed users only
- [ ] Test with user following multiple accounts
- [ ] Test with user following no accounts (should return empty array)
- [ ] Confirm proper pagination support

## Component Testing

### FollowButton Component
- [ ] Verify proper initial state rendering based on following status
- [ ] Test follow/unfollow toggle functionality
- [ ] Confirm loading states are properly displayed
- [ ] Verify error handling and user feedback
- [ ] Test with different size variants (small, medium, large)
- [ ] Confirm callback function execution on follow/unfollow changes
- [ ] Verify button text changes appropriately (Follow/Unfollow)

### UserProfileScreen Component
- [ ] Verify proper display of follower/following counts
- [ ] Test navigation from other user profiles to this screen
- [ ] Confirm FollowButton appears for other users' profiles
- [ ] Verify Edit Profile button appears for current user's profile
- [ ] Test loading and error states
- [ ] Confirm proper user profile information display

### FeedScreen Component
- [ ] Verify tab selector functionality (All Posts/Following)
- [ ] Test switching between feed types
- [ ] Confirm posts from followed users are displayed in "Following" tab
- [ ] Verify all posts are displayed in "All Posts" tab
- [ ] Test pagination in both feed types
- [ ] Confirm pull-to-refresh functionality works in both modes

## Redux Integration Testing

### followSlice Redux Store
- [ ] Verify initial state structure
- [ ] Test followUser async thunk execution and state updates
- [ ] Test unfollowUser async thunk execution and state updates
- [ ] Verify checkFollowingStatus async thunk execution
- [ ] Confirm loading and error state management
- [ ] Test optimistic updates functionality
- [ ] Verify selectors return correct data

### Integration with Other Slices
- [ ] Test interaction between followSlice and postsSlice
- [ ] Verify fetchFollowedPosts functionality in postsSlice
- [ ] Confirm proper state synchronization across slices

## Security and Permissions Testing

### Firestore Security Rules
- [ ] Verify users can only read other users' profiles
- [ ] Confirm users can only modify their own profile data
- [ ] Test follow/unfollow permissions (only authenticated users)
- [ ] Verify subcollection security rules prevent unauthorized access

### Authentication Checks
- [ ] Confirm all operations require authenticated user
- [ ] Test error handling when user is not authenticated
- [ ] Verify proper redirection to login when needed

## Performance Testing

### Database Operations
- [ ] Measure follow/unfollow operation response times
- [ ] Test with users having large follower/following counts
- [ ] Verify efficient querying of followers/following lists
- [ ] Confirm proper indexing for optimal query performance

### UI Responsiveness
- [ ] Test FollowButton responsiveness during network operations
- [ ] Verify smooth transitions between follow/unfollow states
- [ ] Confirm feed loading performance with followed users' posts

## Error Handling and Edge Cases

### Network Failures
- [ ] Test follow/unfollow with poor network connectivity
- [ ] Verify proper error messages to users
- [ ] Confirm state rollback on failed operations
- [ ] Test retry mechanisms

### Edge Cases
- [ ] Attempt to follow user that doesn't exist
- [ ] Follow/unfollow operations with rapidly repeated taps
- [ ] Concurrency testing with multiple simultaneous operations
- [ ] Test with maximum possible followers/following counts

## Integration Testing

### End-to-End Flow
1. Navigate to another user's profile
2. Verify Follow button appears and shows correct initial state
3. Tap Follow button and verify state changes to "Unfollow"
4. Verify follower count increases
5. Navigate to your own profile and verify following count increased
6. Go to feed and switch to "Following" tab to see posts from followed user
7. Return to other user's profile and tap Unfollow
8. Verify state changes back to "Follow"
9. Verify follower count decreases

### Cross-Component Interaction
- [ ] Verify FollowButton state persists when navigating away and back
- [ ] Test that profile screens show updated counts after follow/unfollow
- [ ] Confirm feed updates appropriately after following/unfollowing users

## Compatibility Testing

### Different Devices
- [ ] Test on various screen sizes and resolutions
- [ ] Verify proper responsive design for FollowButton
- [ ] Confirm all functionality works on both iOS and Android

### Different User Scenarios
- [ ] New user account (0 followers/following)
- [ ] User with many followers/following
- [ ] User with no posts but many followers
- [ ] User with many posts but few followers

## Expected Outcomes

Upon successful completion of this test plan, the follow/unfollow system should:
- Allow users to follow and unfollow other users seamlessly
- Maintain accurate follower and following counts
- Provide proper UI feedback during all operations
- Integrate smoothly with existing app functionality
- Handle errors gracefully and provide meaningful feedback to users
- Perform efficiently under various conditions
- Maintain data consistency across the system
- Follow all security best practices