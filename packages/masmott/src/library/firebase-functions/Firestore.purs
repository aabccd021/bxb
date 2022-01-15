module Firebase.Functions.Firestore
  ( CloudFunction
  , DocumentBuilder
  , EventContext
  , QueryDocumentSnapshot
  , document
  , onCreate
  )
  where

import Prelude
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

fromAff2 :: forall a b c. (a -> b -> Aff c) -> a -> b -> Effect (Promise c)
fromAff2 mkAff x y = mkAff x y # fromAff

foreign import _onCreate :: forall a. (QueryDocumentSnapshot -> EventContext -> Effect (Promise a)) -> DocumentBuilder -> CloudFunction

onCreate :: forall a. OnCreateTriggerHandler a -> DocumentBuilder -> CloudFunction
onCreate = fromAff2 >>> _onCreate
