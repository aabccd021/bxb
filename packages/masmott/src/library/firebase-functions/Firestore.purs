module Firebase.Functions.Firestore
  ( CloudFunction
  , DocumentBuilder
  , EventContext
  , document
  , onCreate
  ) where

import Prelude
import Aviary.Birds ((...))
import Control.Promise (Promise, fromAff)
import Data.List (List)
import Data.Map (Map)
import Data.Map as M
import Data.Tuple (Tuple)
import Data.Tuple as T
import Effect (Effect)
import Effect.Aff (Aff)
import Firebase.Admin.Firestore (CollectionPath(..), DocData, DocFieldName(..), DocId(..))

newtype DocumentBuilder
  = DocumentBuilder Unit

newtype CloudFunction
  = CloudFunction Unit

type EventContext
  = Unit

type TriggerCtx
  = { id :: DocId
    , docData :: DocData
    , event :: EventContext
    }

type OnCreateTriggerHandler a
  = (TriggerCtx -> Aff a)

type OnCreateTriggerHandler_ a
  = (TriggerCtx_ -> Effect (Promise a))

type DocData_
  = Map String String

type TriggerCtx_
  = { id :: String
    , docData :: DocData_
    , event :: EventContext
    }

foreign import _document :: String -> DocumentBuilder

document :: CollectionPath -> DocumentBuilder
document (CollectionPath collectionPath) = _document collectionPath

foreign import _onCreate :: forall a. DocumentBuilder -> OnCreateTriggerHandler_ a -> CloudFunction

wrapDocDataEntry :: Tuple String String -> Tuple DocFieldName String
wrapDocDataEntry = T.swap >>> map DocFieldName >>> T.swap

wrapDocDataToList :: DocData_ -> List (Tuple DocFieldName String)
wrapDocDataToList = M.toUnfoldable >>> map wrapDocDataEntry

wrapDocData :: DocData_ -> DocData
wrapDocData = wrapDocDataToList >>> M.fromFoldable

wrapTriggerCtx :: TriggerCtx_ -> TriggerCtx
wrapTriggerCtx { id, docData, event } = { id: DocId id, docData: wrapDocData docData, event }

wrapHandler :: forall c. OnCreateTriggerHandler c -> TriggerCtx_ -> Aff c
wrapHandler handler triggerCtx = handler $ wrapTriggerCtx triggerCtx

onCreateFromCollectionPath :: forall a. CollectionPath -> OnCreateTriggerHandler_ a -> CloudFunction
onCreateFromCollectionPath (CollectionPath collectionPath) = _onCreate $ _document collectionPath

onCreate :: forall c. CollectionPath -> OnCreateTriggerHandler c -> CloudFunction
onCreate collectionPath = onCreateFromCollectionPath collectionPath <<< fromAff ... wrapHandler
