module Firebase.Functions.Firestore
  ( CloudFunction
  , DocumentBuilder
  , EventContext
  , document
  , onCreate
  ) where

import Prelude
import Aviary.Birds (starling', (...))
import Control.Promise (Promise, fromAff)
import Data.List (List)
import Data.Map (Map)
import Data.Map as M
import Data.Tuple (Tuple)
import Data.Tuple as T
import Effect (Effect)
import Effect.Aff (Aff)
import Firebase.Admin.Firestore (CollectionPath(..), DocData, DocFieldName(..), DocId(..), DocSnapshot)

newtype DocumentBuilder
  = DocumentBuilder Unit

newtype CloudFunction
  = CloudFunction Unit

type EventContext
  = Unit

type OnCreateTriggerHandler a
  = (DocSnapshot -> EventContext -> Aff a)

type DocData_
  = Map String String

type TriggerCtx
  = { id :: String
    , docData :: DocData_
    , event :: EventContext
    }

foreign import _document :: String -> DocumentBuilder

document :: CollectionPath -> DocumentBuilder
document (CollectionPath collectionPath) = _document collectionPath

foreign import _onCreate :: forall a. DocumentBuilder -> (TriggerCtx -> Effect (Promise a)) -> CloudFunction

wrapDocDataEntry :: Tuple String String -> Tuple DocFieldName String
wrapDocDataEntry = T.swap >>> map DocFieldName >>> T.swap

wrapDocDataToList :: DocData_ -> List (Tuple DocFieldName String)
wrapDocDataToList = M.toUnfoldable >>> map wrapDocDataEntry

wrapDocData :: DocData_ -> DocData
wrapDocData = wrapDocDataToList >>> M.fromFoldable

wrapSnapshot :: TriggerCtx -> DocSnapshot
wrapSnapshot { id, docData } = { id: DocId id, docData: wrapDocData docData }

wrapHandler :: forall c. OnCreateTriggerHandler c -> TriggerCtx -> Aff c
wrapHandler handler triggerCtx = starling' handler wrapSnapshot _.event triggerCtx

onCreate :: forall c. CollectionPath -> OnCreateTriggerHandler c -> CloudFunction
onCreate (CollectionPath collectionPath) = _onCreate (_document collectionPath) <<< fromAff ... wrapHandler
