module Main
  ( CollectionName(..)
  , SelectViewSpec
  , ViewName(..)
  , ViewSpecs
  , makeViewCollectionPath
  , onViewSrcCreated
  ) where

import Prelude
import Control.Parallel (parSequence)
import Data.FunctorWithIndex (mapWithIndex)
import Data.List (List)
import Data.Map (Map)
import Data.Map as M
import Data.Tuple.Nested (Tuple3, tuple3, uncurry3)
import Effect.Aff (Aff)
import Firebase.Admin.Firestore (CollectionPath(..), CreateDocResult, DocData, DocFieldName, DocId, DocSnapshot, createDoc)

newtype CollectionName
  = CollectionName String

newtype ViewName
  = ViewName String

type SelectViewSpec
  = Map DocFieldName Unit

type ViewSpecs
  = Map ViewName SelectViewSpec

derive newtype instance eqViewName :: Eq ViewName

derive newtype instance ordViewName :: Ord ViewName

type CreateDocAction
  = { collection :: CollectionPath
    , docData :: DocData
    , id :: DocId
    }

type SnapshotTriggerCtx
  = { collectionName :: CollectionName
    , docSnapshot :: DocSnapshot
    }

makeViewCollectionPath :: CollectionName -> ViewName -> CollectionPath
makeViewCollectionPath (CollectionName collection) (ViewName viewName) = CollectionPath $ collection <> "_" <> viewName

materializeSelectView :: SelectViewSpec -> DocData -> DocData
materializeSelectView spec = M.filterKeys $ flip M.member spec

createView :: SnapshotTriggerCtx -> ViewName -> SelectViewSpec -> Tuple3 CollectionPath DocId DocData
createView { collectionName, docSnapshot } viewName viewSpec = tuple3 collectionPath docId docData
  where
  collectionPath = (makeViewCollectionPath collectionName viewName)

  docId = docSnapshot.id

  docData = (materializeSelectView viewSpec docSnapshot.docData)

onViewSrcCreated :: SnapshotTriggerCtx -> ViewSpecs -> Aff (List CreateDocResult)
onViewSrcCreated ctx =
  mapWithIndex (createView ctx)
    >>> M.values
    >>> map (uncurry3 createDoc)
    >>> parSequence
