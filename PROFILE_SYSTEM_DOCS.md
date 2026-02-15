# User Profile System - Technical Documentation

## Firestore Database Structure

### Users Collection

```
/users/{userId}
```

**Document Structure:**

```javascript
{
  uid: string,           // Firebase Auth UID
  name: string,          // User's full name
  bio: string,           // User biography (max 150 chars)
  profileImage: string,  // Firebase Storage URL or null
  createdAt: number,     // Timestamp when profile was created
  updatedAt: number,     // Timestamp when profile was last updated
  email: string,         // User's email (from Firebase Auth)
  // Additional fields can be added as needed
}
```

### Storage Structure

```
/profile_images/{userId}_{timestamp}.jpg
```

## Image Upload Logic Flow

1. **Image Selection**: User selects image from camera or gallery
2. **Local Processing**: Image is resized and compressed locally
3. **Upload to Storage**: Image uploaded to Firebase Storage
4. **Get Download URL**: Retrieve public URL for the uploaded image
5. **Update Profile**: Save profile data with image URL to Firestore
6. **Update Auth**: Sync display name and photo URL with Firebase Auth

## Best Practices Implemented

### 1. Security

- **Storage Security Rules**: Only authenticated users can upload images
- **Firestore Security Rules**: Users can only read/write their own profile
- **Input Validation**: Client-side and server-side validation for all inputs
- **Secure Image URLs**: Using Firebase Storage download URLs

### 2. Performance

- **Image Compression**: Images are resized to max 1000x1000 pixels
- **Efficient Storage**: Using appropriate compression quality (0.8)
- **Caching**: Leveraging Firebase's built-in caching
- **Lazy Loading**: Images loaded only when needed

### 3. User Experience

- **Loading States**: Visual feedback during upload and save operations
- **Error Handling**: Graceful error messages and recovery options
- **Preview**: Real-time image preview before saving
- **Accessibility**: Proper labels and touch targets

### 4. Data Management

- **Atomic Operations**: Profile updates happen in single transactions
- **Consistency**: Keeping Firebase Auth and Firestore in sync
- **Backup Strategy**: Firebase automatically backs up data
- **Cleanup**: Removing unused images (optional implementation)

## Security Rules Example

### Firestore Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read: if request.auth != null;
      allow create, update: if request.auth != null && request.auth.uid == userId;
      allow delete: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### Storage Rules

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /profile_images/{imageId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null &&
                   request.resource.size < 5 * 1024 * 1024 && // 5MB limit
                   request.resource.contentType.matches('image/.*');
    }
  }
}
```

## Error Handling Strategy

### Common Error Scenarios:

1. **Network Issues**: Retry mechanism with exponential backoff
2. **Permission Denied**: Clear user-facing error messages
3. **Image Too Large**: Client-side validation before upload
4. **Invalid Image Format**: MIME type checking
5. **Storage Quota**: Monitoring and alerts

### Error Recovery:

- Local state preservation during failures
- Option to retry failed operations
- Graceful degradation (fallback to default avatar)
- Detailed logging for debugging

## Scalability Considerations

### Current Implementation:

- Handles up to thousands of users efficiently
- Images stored in Firebase Storage CDN
- Firestore indexes for fast queries

### Future Enhancements:

- Cloud Functions for image processing
- Pagination for user lists
- Caching strategies for frequently accessed profiles
- Analytics integration for user engagement metrics

## Testing Strategy

### Unit Tests:

- Image processing functions
- Validation logic
- Error handling scenarios

### Integration Tests:

- Full profile creation flow
- Image upload and retrieval
- Navigation between screens

### Manual Testing:

- Different device sizes and orientations
- Various network conditions
- Edge cases (empty bio, special characters in name)
