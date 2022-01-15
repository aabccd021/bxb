module Main where

import Prelude
import Data.Map (Map)
import Data.Map as M
import Effect (Effect)
import Effect.Console (log)

main :: Effect Unit
main = do
  log "🍝"

type SelectViewSpec
  = Map String String

type DocData
  = Map String String

makeViewCollectionPath :: String -> String -> String
makeViewCollectionPath collection view = collection <> "_" <> view

materializeSelectView :: SelectViewSpec -> DocData -> DocData
materializeSelectView spec = M.filterKeys $ flip M.member spec
