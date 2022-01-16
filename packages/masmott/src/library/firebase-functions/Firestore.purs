module Firebase.Functions.Firestore
  ( CloudFunction
  , DocumentBuilder
  , EventContext
  , QueryDocumentSnapshot
  , document
  , onCreate
  ) where

import Prelude
import Aviary.Birds ((...))
import Control.Promise (Promise, fromAff)
import Effect (Effect)
import Effect.Aff (Aff)

newtype DocumentBuilder
  = DocumentBuilder Unit

newtype CloudFunction
  = CloudFunction Unit

type QueryDocumentSnapshot
  = Unit

type EventContext
  = Unit

type OnCreateTriggerHandler a
  = (QueryDocumentSnapshot -> EventContext -> Aff a)

foreign import _document :: String -> DocumentBuilder

document :: String -> DocumentBuilder
document = _document

foreign import _onCreate :: forall a. (QueryDocumentSnapshot -> EventContext -> Effect (Promise a)) -> DocumentBuilder -> CloudFunction

onCreate :: forall a. OnCreateTriggerHandler a -> DocumentBuilder -> CloudFunction
onCreate = _onCreate <<< (...) fromAff
