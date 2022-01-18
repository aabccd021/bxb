module Firebase.Admin.Firestore
  ( CollectionPath(..)
  , CreateDocResult
  , DocData
  , DocFieldName(..)
  , DocId(..)
  , DocSnapshot
  , FirebaseError(..)
  , Timestamp
  , createDoc
  )
  where

import Prelude
import Control.Promise (Promise, toAff)
import Data.Either (Either(..))
import Data.Map (Map)
import Effect.Aff (Aff)

newtype DocFieldName
  = DocFieldName String

derive newtype instance eqDocFieldName :: Eq DocFieldName

derive newtype instance ordDocFieldName :: Ord DocFieldName

type DocData
  = Map DocFieldName String

newtype DocId
  = DocId String

newtype CollectionPath
  = CollectionPath String

type DocSnapshot
  = { id :: DocId
    , docData :: DocData
    }

type Timestamp
  = { seconds :: Int
    , nanoseconds :: Int
    }

newtype FirebaseError
  = FirebaseError String

foreign import _createDoc :: (String -> Either String Timestamp) -> (Timestamp -> Either String Timestamp) -> String -> String -> DocData -> Promise (Either String Timestamp)

leftToFirebaseError :: Either String Timestamp -> Either FirebaseError Timestamp
leftToFirebaseError (Left l) = Left $ FirebaseError l

leftToFirebaseError (Right r) = Right r

type CreateDocResult
  = Either FirebaseError Timestamp

createDoc :: CollectionPath -> DocId -> DocData -> Aff CreateDocResult
createDoc (CollectionPath collectionPath) (DocId docId) = _createDoc Left Right collectionPath docId >>> toAff >>> map leftToFirebaseError
