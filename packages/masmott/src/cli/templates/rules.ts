export const rules = () => `service cloud.firestore {
  match /databases/{database}/documents {
    match /post/{docId} {
      allow create: if (
      request.resource.data.keys().hasOnly(['text', 'title']) &&
      request.resource.data.text is string &&
      request.resource.data.title is string
      );
    }
    match /post_card/{docId} {
      allow get: if true;
    }
    match /post_page/{docId} {
      allow get: if true;
    }
  }
}
`;
