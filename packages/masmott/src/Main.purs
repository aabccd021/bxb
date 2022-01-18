module Main
  ( SelectViewSpec
  , a
  , onViewSrcCreated
  , onViewSrcCreated'
  )
  where

import Prelude

import Control.Parallel (parSequence)
import Data.FunctorWithIndex (mapWithIndex)
import Data.List (List)
import Data.Map (Map)
import Data.Map as M
import Data.Maybe (Maybe(..))
import Data.Tuple (Tuple(..))
import Effect.Aff (Aff)
import Firebase.Admin.Firestore (CreateDocResult, DocData, DocFieldName(..))
import Firebase.Admin.Firestore as FAF
import Firebase.Functions.Firestore (CloudFunction, TriggerCtx)
import Trigger (CollectionName(..), ViewName, makeViewCollectionPath, onCreate)

type SelectViewSpec
  = Map DocFieldName Unit

type ViewSpecs
  = Map ViewName SelectViewSpec

materializeSelectView :: SelectViewSpec -> DocData -> DocData
materializeSelectView spec = M.filterKeys $ flip M.member spec

createView :: CollectionName -> TriggerCtx -> ViewName -> SelectViewSpec -> Aff CreateDocResult
createView collectionName ctx viewName viewSpec = FAF.createDoc collectionPath docId docData
  where
  collectionPath = (makeViewCollectionPath collectionName (Just viewName))
  docId = ctx.id
  docData = (materializeSelectView viewSpec ctx.docData)

onViewSrcCreated :: ViewSpecs -> CollectionName -> Maybe ViewName -> TriggerCtx -> Aff (List CreateDocResult)
onViewSrcCreated viewSpecs collectionName _ ctx =
  viewSpecs
    # mapWithIndex (createView collectionName ctx)
    # M.values
    # parSequence

onViewSrcCreated' :: ViewSpecs -> CollectionName -> Maybe ViewName -> CloudFunction
onViewSrcCreated' viewSpecs collectionName viewName = onCreate collectionName viewName handler
  where handler = onViewSrcCreated viewSpecs collectionName viewName 

x :: SelectViewSpec
x = M.fromFoldable [ Tuple (DocFieldName "a") unit ]

a :: CloudFunction
a = onViewSrcCreated' M.empty (CollectionName "user") Nothing