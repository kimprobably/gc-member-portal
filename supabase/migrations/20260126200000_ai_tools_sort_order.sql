-- Add sort_order column to ai_tools for drag-and-drop reordering
ALTER TABLE ai_tools ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0;

-- Initialize sort_order based on current ordering (by name)
WITH ordered_tools AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY name) - 1 AS new_order
  FROM ai_tools
)
UPDATE ai_tools
SET sort_order = ordered_tools.new_order
FROM ordered_tools
WHERE ai_tools.id = ordered_tools.id;

-- Create index for efficient ordering
CREATE INDEX IF NOT EXISTS idx_ai_tools_sort_order ON ai_tools(sort_order);
