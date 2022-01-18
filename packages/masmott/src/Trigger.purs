module Trigger where

import Prelude

import Data.Maybe (Maybe(..))
import Firebase.Admin.Firestore (CollectionPath(..))
import Firebase.Functions.Firestore as FFF
import Firebase.Functions.Firestore (CloudFunction, OnCreateTriggerHandler)


newtype CollectionName = CollectionName String
newtype ViewName = ViewName String

derive newtype instance eqViewName :: Eq ViewName

derive newtype instance ordViewName :: Ord ViewName

makeViewCollectionPath :: CollectionName -> Maybe ViewName -> CollectionPath
makeViewCollectionPath (CollectionName collection) viewName = CollectionPath $ collection <> "_" <> showViewName viewName

showViewName :: Maybe ViewName -> String
showViewName (Just (ViewName viewName)) = viewName
showViewName _ = ""

onCreate :: forall c. CollectionName -> Maybe ViewName -> OnCreateTriggerHandler c -> CloudFunction
onCreate collectionName viewName handler = FFF.onCreate collectionPath handler
  where collectionPath = makeViewCollectionPath collectionName viewName
