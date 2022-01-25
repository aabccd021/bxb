module Main where

import Prelude

import Data.Map as M
import Data.Maybe (Maybe(..))
import Data.Tuple (Tuple(..))
import Firebase.Admin.Firestore (DocFieldName(..))
import Firebase.Functions.Firestore (CloudFunction)
import Masmott (ViewSpecs, onViewSrcCreatedTrigger)
import Trigger (CollectionName(..), ViewName(..))

fooViewSpecs :: ViewSpecs
fooViewSpecs =
  M.fromFoldable
    [ Tuple (ViewName "card")
        $ M.fromFoldable
            [ Tuple (DocFieldName "title") unit
            ]
    , Tuple (ViewName "page")
        $ M.fromFoldable
            [ Tuple (DocFieldName "title") unit
            , Tuple (DocFieldName "text") unit
            ]
    ]

masmott :: CloudFunction
masmott = onViewSrcCreatedTrigger fooViewSpecs (CollectionName "user") Nothing

