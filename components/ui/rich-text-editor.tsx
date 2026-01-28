"use client";

import isHotkey from "is-hotkey";
import React, {
  KeyboardEvent,
  PointerEvent,
  useCallback,
  useMemo,
  useState,
  useEffect,
} from "react";
import {
  Descendant,
  Editor,
  Element as SlateElement,
  Transforms,
  createEditor,
  Text,
  Range,
  Point,
} from "slate";
import { withHistory } from "slate-history";
import {
  Editable,
  RenderElementProps,
  RenderLeafProps,
  Slate,
  useSlate,
  withReact,
  useSelected,
  useFocused,
  ReactEditor,
} from "slate-react";
import { Button } from "@/components/ui/button";
import {
  Bold,
  Italic,
  Underline,
  Code,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Quote,
  Heading1,
  Heading2,
  Heading3,
  Heading4,
  ImagePlus,
  X,
  Link as LinkIcon,
  Grid3x3,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Types
type CustomElementType =
  | "paragraph"
  | "heading-one"
  | "heading-two"
  | "heading-three"
  | "heading-four"
  | "block-quote"
  | "numbered-list"
  | "bulleted-list"
  | "list-item"
  | "image"
  | "table"
  | "table-row"
  | "table-cell";
type CustomTextKey = "bold" | "italic" | "underline" | "code";

type LinkText = CustomText & {
  link?: string;
};

type ImageElement = {
  type: "image";
  url: string;
  link?: string;
  alt?: string;
  children: CustomText[];
};

type TableCellElement = {
  type: "table-cell";
  header?: boolean;
  children: CustomText[];
};

type TableRowElement = {
  type: "table-row";
  children: TableCellElement[];
};

type TableElement = {
  type: "table";
  children: TableRowElement[];
};

type CustomElement =
  | {
      type: Exclude<
        CustomElementType,
        "image" | "table" | "table-row" | "table-cell"
      >;
      align?: "left" | "center" | "right" | "justify";
      children: (CustomText | CustomElement)[];
    }
  | ImageElement
  | TableElement
  | TableRowElement
  | TableCellElement;

type CustomText = {
  text: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  code?: boolean;
  link?: string;
  linkTitle?: string;
};

declare module "slate" {
  interface CustomTypes {
    Editor: Editor & ReactEditor;
    Element: CustomElement;
    Text: CustomText;
  }
}

const HOTKEYS: Record<string, CustomTextKey> = {
  "mod+b": "bold",
  "mod+i": "italic",
  "mod+u": "underline",
  "mod+`": "code",
};

const LIST_TYPES = ["numbered-list", "bulleted-list"] as const;
const TEXT_ALIGN_TYPES = ["left", "center", "right", "justify"] as const;

type AlignType = (typeof TEXT_ALIGN_TYPES)[number];
type ListType = (typeof LIST_TYPES)[number];
type CustomElementFormat = CustomElementType | AlignType | ListType;

// Extend editor with image and table support
const withImages = (editor: Editor & ReactEditor): Editor & ReactEditor => {
  const { isVoid } = editor;

  editor.isVoid = (element: any) => {
    const type = (element as CustomElement).type;
    return type === "image" ? true : isVoid(element);
  };

  return editor;
};

const withTables = (editor: Editor & ReactEditor): Editor & ReactEditor => {
  const { deleteBackward, insertBreak } = editor;

  editor.deleteBackward = (unit: any) => {
    const { selection } = editor;

    if (selection && Range.isCollapsed(selection)) {
      const [cell] = Editor.nodes(editor, {
        match: (n) => (n as CustomElement).type === "table-cell",
      });

      if (cell) {
        const [, cellPath] = cell;
        const start = Editor.start(editor, cellPath);

        if (Point.equals(selection.anchor, start)) {
          return;
        }
      }
    }

    deleteBackward(unit);
  };

  editor.insertBreak = () => {
    const { selection } = editor;

    if (selection) {
      const [table] = Editor.nodes(editor, {
        match: (n) => (n as CustomElement).type === "table",
      });

      if (table) {
        // If we're inside a table, prevent Enter from breaking out
        return;
      }
    }

    insertBreak();
  };

  return editor;
};

const withTableNormalization = (
  editor: Editor & ReactEditor
): Editor & ReactEditor => {
  const { normalizeNode } = editor;

  editor.normalizeNode = (entry: any) => {
    const [node, path] = entry;

    // Normalize table: must only contain table-rows
    if (SlateElement.isElement(node) && node.type === "table") {
      const tableNode = node as TableElement;
      for (let i = 0; i < tableNode.children.length; i++) {
        const child = tableNode.children[i];
        if (child.type !== "table-row") {
          Transforms.removeNodes(editor, { at: [...path, i] });
          return;
        }
      }
    }

    // Normalize table-row: must only contain table-cells
    if (SlateElement.isElement(node) && node.type === "table-row") {
      const rowNode = node as TableRowElement;
      for (let i = 0; i < rowNode.children.length; i++) {
        const child = rowNode.children[i];
        if (child.type !== "table-cell") {
          Transforms.removeNodes(editor, { at: [...path, i] });
          return;
        }
      }
    }

    // Normalize table-cell: ensure it has text children
    if (SlateElement.isElement(node) && node.type === "table-cell") {
      const cellNode = node as TableCellElement;

      // Remove any invalid nested structures
      for (let i = cellNode.children.length - 1; i >= 0; i--) {
        const child = cellNode.children[i];
        if (!Text.isText(child)) {
          Transforms.removeNodes(editor, { at: [...path, i] });
          return;
        }
      }

      // Ensure cell has at least one text node
      if (cellNode.children.length === 0) {
        Transforms.insertNodes(editor, { text: "" }, { at: [...path, 0] });
        return;
      }
    }

    normalizeNode(entry);
  };

  return editor;
};

export function RichTextEditor({
  content,
  onChange,
  placeholder = "Write your content here...",
  disabled = false,
}: {
  content: Record<string, any>;
  onChange: (content: Record<string, any>) => void;
  placeholder?: string;
  disabled?: boolean;
}) {
  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [imageLink, setImageLink] = useState("");
  const [imageAlt, setImageAlt] = useState("");

  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [linkText, setLinkText] = useState("");
  const [linkAlt, setLinkAlt] = useState("");

  const [tableDialogOpen, setTableDialogOpen] = useState(false);
  const [tableRows, setTableRows] = useState(3);
  const [tableCols, setTableCols] = useState(3);

  const renderElement = useCallback(
    (props: RenderElementProps) => <Element {...props} />,
    []
  );
  const renderLeaf = useCallback(
    (props: RenderLeafProps) => <Leaf {...props} />,
    []
  );
const editor = useMemo(
  () =>
    withTableNormalization(
      withTables(withImages(withHistory(withReact(createEditor()))))
    ),
  []
);

  // Convert HTML to Slate value or use default
  const initialValue = useMemo((): Descendant[] => {
    if (content.html && content.html.trim() !== "") {
      try {
        return htmlToSlate(content.html);
      } catch (e) {
        console.warn("Failed to parse HTML content, using default");
      }
    }
    return [{ type: "paragraph", children: [{ text: "" }] }];
  }, [content.html]);

  const [value, setValue] = useState<Descendant[]>(initialValue);

  // Update value when content changes externally
  useEffect(() => {
    if (content.html !== slateToHtml(value)) {
      setValue(initialValue);
    }
  }, [content.html, initialValue, value]);

  const handleChange = useCallback(
    (newValue: Descendant[]) => {
      setValue(newValue);

      const isAstChange = editor.operations.some(
        (op: any) => "set_selection" !== op.type
      );

      if (isAstChange) {
        const html = slateToHtml(newValue);
        onChange({ html });
      }
    },
    [editor.operations, onChange]
  );

  const insertImage = () => {
    if (!imageUrl) return;

    const image: ImageElement = {
      type: "image",
      url: imageUrl,
      ...(imageLink && { link: imageLink }),
      ...(imageAlt && { alt: imageAlt }),
      children: [{ text: "" }],
    };

    Transforms.insertNodes(editor, image);
    Transforms.insertNodes(editor, {
      type: "paragraph",
      children: [{ text: "" }],
    });

    // Reset form
    setImageUrl("");
    setImageLink("");
    setImageAlt("");
    setImageDialogOpen(false);
  };

  const insertLink = () => {
    if (!linkUrl) return;

    const { selection } = editor;

    if (!selection) {
      // No selection, insert text with link marks
      Transforms.insertText(editor, linkText || linkUrl);
      addMarkToSelection(editor, "link", linkUrl);
      if ((linkText || linkUrl) && linkAlt)
        addMarkToSelection(editor, "linkTitle", linkAlt);
    } else if (Range.isCollapsed(selection)) {
      // Collapsed selection, insert text with link
      Transforms.insertText(editor, linkText || linkUrl);
      // select the newly inserted text so we can mark it
      const { anchor } = editor.selection!;
      const newAnchor = { path: anchor.path, offset: anchor.offset };
      const startOffset = anchor.offset - (linkText || linkUrl).length;
      Transforms.select(editor, {
        anchor: { path: anchor.path, offset: startOffset },
        focus: newAnchor,
      } as any);
      addMarkToSelection(editor, "link", linkUrl);
      if (linkAlt) addMarkToSelection(editor, "linkTitle", linkAlt);
    } else {
      // Text selected, apply link marks
      addMarkToSelection(editor, "link", linkUrl);
      if (linkAlt) addMarkToSelection(editor, "linkTitle", linkAlt);
    }

    // Reset form
    setLinkUrl("");
    setLinkText("");
    setLinkDialogOpen(false);
  };

  const addMarkToSelection = (editor: Editor, key: string, value: string) => {
    Editor.addMark(editor, key, value);
  };

  const insertTable = () => {
    // Create header row cells
    const headerCells: TableCellElement[] = Array.from({
      length: tableCols,
    }).map((_, index) => ({
      type: "table-cell",
      header: true,
      children: [{ text: `Header ${index + 1}` }],
    }));

    const rows: TableRowElement[] = [
      {
        type: "table-row",
        children: headerCells,
      },
    ];

    // Add data rows
    for (let i = 1; i < tableRows; i++) {
      const dataCells: TableCellElement[] = Array.from({
        length: tableCols,
      }).map(() => ({
        type: "table-cell",
        children: [{ text: "" }],
      }));

      rows.push({
        type: "table-row",
        children: dataCells,
      });
    }

    const table: TableElement = {
      type: "table",
      children: rows,
    };

    const paragraph = {
      type: "paragraph",
      children: [{ text: "" }],
    };

    // Insert table
    Transforms.insertNodes(editor, table);

    // Insert paragraph after table
    Transforms.insertNodes(editor, paragraph);

    // Move selection to the paragraph below the table
    Transforms.move(editor, { unit: "offset" });

    // Reset form
    setTableRows(3);
    setTableCols(3);
    setTableDialogOpen(false);
  };

  return (
    <div className="border rounded-lg">
      <Slate editor={editor} initialValue={value} onChange={handleChange}>
        <div className="flex items-center gap-1 p-2 border-b bg-muted/30 flex-wrap">
          {/* Text Formatting */}
          <MarkButton format="bold" icon={<Bold className="h-4 w-4" />} />
          <MarkButton format="italic" icon={<Italic className="h-4 w-4" />} />
          <MarkButton
            format="underline"
            icon={<Underline className="h-4 w-4" />}
          />
          {/* <MarkButton format="code" icon={<Code className="h-4 w-4" />} /> */}

          <div className="w-px h-6 bg-border mx-1" />

          {/* Headings */}
          <BlockButton
            format="heading-one"
            icon={<Heading1 className="h-4 w-4" />}
          />
          <BlockButton
            format="heading-two"
            icon={<Heading2 className="h-4 w-4" />}
          />
          <BlockButton
            format="heading-three"
            icon={<Heading3 className="h-4 w-4" />}
          />
          <BlockButton
            format="heading-four"
            icon={<Heading4 className="h-4 w-4" />}
          />
          <BlockButton
            format="block-quote"
            icon={<Quote className="h-4 w-4" />}
          />

          <div className="w-px h-6 bg-border mx-1" />

          {/* Lists */}
          <BlockButton
            format="bulleted-list"
            icon={<List className="h-4 w-4" />}
          />
          <BlockButton
            format="numbered-list"
            icon={<ListOrdered className="h-4 w-4" />}
          />

          <div className="w-px h-6 bg-border mx-1" />

          {/* Alignment */}
          <BlockButton format="left" icon={<AlignLeft className="h-4 w-4" />} />
          <BlockButton
            format="center"
            icon={<AlignCenter className="h-4 w-4" />}
          />
          <BlockButton
            format="right"
            icon={<AlignRight className="h-4 w-4" />}
          />
          <BlockButton
            format="justify"
            icon={<AlignJustify className="h-4 w-4" />}
          />

          <div className="w-px h-6 bg-border mx-1" />

          {/* Image */}
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onPointerDown={(event: PointerEvent<HTMLButtonElement>) =>
              event.preventDefault()
            }
            onClick={() => setImageDialogOpen(true)}
          >
            <ImagePlus className="h-4 w-4" />
          </Button>

          {/* Link */}
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onPointerDown={(event: PointerEvent<HTMLButtonElement>) =>
              event.preventDefault()
            }
            onClick={() => setLinkDialogOpen(true)}
          >
            <LinkIcon className="h-4 w-4" />
          </Button>

          {/* Table */}
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onPointerDown={(event: PointerEvent<HTMLButtonElement>) =>
              event.preventDefault()
            }
            onClick={() => setTableDialogOpen(true)}
          >
            <Grid3x3 className="h-4 w-4" />
          </Button>
        </div>

        <div className="relative">
          <Editable
            renderElement={renderElement}
            renderLeaf={renderLeaf}
            placeholder={placeholder}
            className="min-h-[300px] p-4 text-base outline-none prose prose-sm max-w-none
              [&_ul]:list-disc [&_ul]:ml-6 [&_ol]:list-decimal [&_ol]:ml-6 
              [&_li]:my-1 [&_blockquote]:border-l-4 [&_blockquote]:border-gray-300 
              [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-gray-600
              [&_h1]:text-3xl [&_h1]:font-bold [&_h1]:my-4
              [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:my-3
              [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:my-3
              [&_h4]:text-base [&_h4]:font-semibold [&_h4]:my-2
              [&_code]:bg-gray-100 [&_code]:px-1 [&_code]:rounded [&_code]:text-sm [&_code]:font-mono"
            readOnly={disabled}
            onKeyDown={(event: KeyboardEvent<HTMLDivElement>) => {
              for (const hotkey in HOTKEYS) {
                if (isHotkey(hotkey, event as any)) {
                  event.preventDefault();
                  const mark = HOTKEYS[hotkey];
                  toggleMark(editor, mark);
                }
              }
            }}
          />
        </div>
      </Slate>

      {/* Image Insert Dialog */}
      <Dialog open={imageDialogOpen} onOpenChange={setImageDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Insert Image</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="image-url">Image URL *</Label>
              <Input
                id="image-url"
                placeholder="https://example.com/image.jpg"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="image-link">Link URL (optional)</Label>
              <Input
                id="image-link"
                placeholder="https://example.com/destination"
                value={imageLink}
                onChange={(e) => setImageLink(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                If provided, clicking the image will open this link in a new tab
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="image-alt">Alt Text (optional)</Label>
              <Input
                id="image-alt"
                placeholder="Description of the image"
                value={imageAlt}
                onChange={(e) => setImageAlt(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setImageDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={insertImage} disabled={!imageUrl}>
              Insert Image
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Link Insert Dialog */}
      <Dialog open={linkDialogOpen} onOpenChange={setLinkDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Insert Link</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="link-url">Link URL *</Label>
              <Input
                id="link-url"
                placeholder="https://example.com"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="link-text">Link Text (optional)</Label>
              <Input
                id="link-text"
                placeholder="Text to display"
                value={linkText}
                onChange={(e) => setLinkText(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                If you have text selected, it will be used as the link.
                Otherwise, the link URL or custom text will be displayed.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="link-alt">Alt / Title (SEO, optional)</Label>
              <Input
                id="link-alt"
                placeholder="Short description for SEO"
                value={linkAlt}
                onChange={(e) => setLinkAlt(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Optional alt/title text added as the anchor's title attribute
                for SEO.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setLinkDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={insertLink} disabled={!linkUrl}>
              Insert Link
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Table Insert Dialog */}
      <Dialog open={tableDialogOpen} onOpenChange={setTableDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Insert Table</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <Label htmlFor="table-rows">Rows: {tableRows}</Label>
              <input
                id="table-rows"
                type="range"
                min="1"
                max="10"
                value={tableRows}
                onChange={(e) => setTableRows(parseInt(e.target.value))}
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="table-cols">Columns: {tableCols}</Label>
              <input
                id="table-cols"
                type="range"
                min="1"
                max="10"
                value={tableCols}
                onChange={(e) => setTableCols(parseInt(e.target.value))}
                className="w-full"
              />
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground mb-3">Preview:</p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse border border-gray-300">
                  <tbody>
                    {Array(Math.min(tableRows, 3))
                      .fill(null)
                      .map((_, rowIdx) => (
                        <tr key={rowIdx}>
                          {Array(tableCols)
                            .fill(null)
                            .map((_, colIdx) => (
                              <td
                                key={colIdx}
                                className="border border-gray-300 px-2 py-1 text-center text-gray-500"
                              >
                                {rowIdx === 0 ? `Col ${colIdx + 1}` : ""}
                              </td>
                            ))}
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTableDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={insertTable}>
              Insert Table ({tableRows}x{tableCols})
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Core functions from Slate demo
const toggleBlock = (editor: Editor, format: CustomElementFormat) => {
  const isActive = isBlockActive(
    editor,
    format,
    isAlignType(format) ? "align" : "type"
  );
  const isList = isListType(format);

  Transforms.unwrapNodes(editor, {
    match: (n: any) =>
      !Editor.isEditor(n) &&
      SlateElement.isElement(n) &&
      isListType((n as CustomElement).type as any) &&
      !isAlignType(format),
    split: true,
  });

  let newProperties: Partial<SlateElement>;
  if (isAlignType(format)) {
    newProperties = {
      align: isActive ? undefined : format,
    } as any;
  } else {
    newProperties = {
      type: isActive ? "paragraph" : isList ? "list-item" : format,
    } as any;
  }
  Transforms.setNodes<SlateElement>(editor, newProperties);

  if (!isActive && isList) {
    const block = { type: format, children: [] };
    Transforms.wrapNodes(editor, block);
  }
};

const toggleMark = (editor: Editor, format: CustomTextKey) => {
  const isActive = isMarkActive(editor, format);

  if (isActive) {
    Editor.removeMark(editor, format);
  } else {
    Editor.addMark(editor, format, true);
  }
};

const isBlockActive = (
  editor: Editor,
  format: CustomElementFormat,
  blockType: "type" | "align" = "type"
) => {
  const { selection } = editor;
  if (!selection) return false;

  const [match] = Array.from(
    Editor.nodes(editor, {
      at: Editor.unhangRange(editor, selection),
      match: (n: any) => {
        if (!Editor.isEditor(n) && SlateElement.isElement(n)) {
          const element = n as CustomElement;
          if (blockType === "align" && isAlignElement(element)) {
            return element.align === format;
          }
          return element.type === format;
        }
        return false;
      },
    })
  );

  return !!match;
};

const isMarkActive = (editor: Editor, format: CustomTextKey) => {
  const marks = Editor.marks(editor);
  return marks ? marks[format] === true : false;
};

// Image element renderer
const ImageElement = ({
  attributes,
  children,
  element,
}: RenderElementProps) => {
  const editor = useSlate();
  const selected = useSelected();
  const focused = useFocused();
  const imageElement = element as ImageElement;

  const removeImage = () => {
    const path = ReactEditor.findPath(editor as ReactEditor, element);
    Transforms.removeNodes(editor, { at: path });
  };

  const imageContent = (
    <div className="relative inline-block group">
      <img
        src={imageElement.url}
        alt={imageElement.alt || ""}
        className={`max-w-full h-auto rounded-lg ${
          selected && focused ? "ring-2 ring-blue-500" : ""
        } ${
          imageElement.link
            ? "cursor-pointer hover:opacity-90 transition-opacity"
            : ""
        }`}
        style={{ maxHeight: "500px" }}
      />
      {selected && focused && (
        <button
          onClick={removeImage}
          className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
          contentEditable={false}
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );

  return (
    <div {...attributes} contentEditable={false} className="my-4">
      {children}
      {imageElement.link ? (
        <div className="border-2 border-blue-200 rounded-lg p-3 bg-blue-50/50 hover:bg-blue-50 transition-colors">
          <a
            href={imageElement.link}
            target="_blank"
            rel="noopener noreferrer"
            className="block"
          >
            {imageContent}
            <div className="mt-2 text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1">
              <span className="font-medium">🔗 Click to open:</span>
              <span className="truncate">{imageElement.link}</span>
            </div>
          </a>
        </div>
      ) : (
        imageContent
      )}
    </div>
  );
};

// Table element renderer with simple toolbar (add/delete row/col, delete table)
const TableElement = ({
  attributes,
  children,
  element,
}: RenderElementProps) => {
  const editor = useSlate();
  const selected = useSelected();
  const focused = useFocused();

  const tableElement = element as TableElement;

  const addRow = () => {
    const tablePath = ReactEditor.findPath(editor as ReactEditor, element);
    const colCount = (tableElement.children[0]?.children || []).length || 1;
    const newRow: TableRowElement = {
      type: "table-row",
      children: Array.from({ length: colCount }).map(() => ({
        type: "table-cell",
        children: [{ text: "" }],
      })),
    };
    Transforms.insertNodes(editor, newRow, {
      at: [...tablePath, tableElement.children.length],
    });
  };

  const deleteLastRow = () => {
    const tablePath = ReactEditor.findPath(editor as ReactEditor, element);
    const lastIndex = tableElement.children.length - 1;
    if (lastIndex < 0) return;
    if (tableElement.children.length === 1) {
      // Remove whole table and ensure paragraph after
      Transforms.removeNodes(editor, { at: tablePath });
      Transforms.insertNodes(editor, {
        type: "paragraph",
        children: [{ text: "" }],
      });
      return;
    }
    Transforms.removeNodes(editor, { at: [...tablePath, lastIndex] });
  };

  const addColumn = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const tablePath = ReactEditor.findPath(editor as ReactEditor, element);
    const rows = tableElement.children;

    // Process rows in reverse to avoid path issues
    for (let rIdx = rows.length - 1; rIdx >= 0; rIdx--) {
      const row = rows[rIdx];
      const isHeader = rIdx === 0;
      const insertAt = [...tablePath, rIdx, row.children.length];

      Transforms.insertNodes(
        editor,
        {
          type: "table-cell",
          header: isHeader,
          children: [{ text: "" }],
        } as TableCellElement,
        { at: insertAt }
      );
    }
  };

  const deleteLastColumn = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const tablePath = ReactEditor.findPath(editor as ReactEditor, element);
    const rows = tableElement.children;
    const firstRowCols = (rows[0]?.children || []).length;

    if (firstRowCols <= 1) {
      // Remove table and ensure paragraph after
      Transforms.removeNodes(editor, { at: tablePath });
      Transforms.insertNodes(editor, {
        type: "paragraph",
        children: [{ text: "" }],
      });
      return;
    }

    // Process rows in reverse to avoid path issues
    for (let rIdx = rows.length - 1; rIdx >= 0; rIdx--) {
      const lastCellIndex = rows[rIdx].children.length - 1;
      if (lastCellIndex >= 0) {
        Transforms.removeNodes(editor, {
          at: [...tablePath, rIdx, lastCellIndex],
        });
      }
    }
  };

  const deleteTable = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const tablePath = ReactEditor.findPath(editor as ReactEditor, element);
    Transforms.removeNodes(editor, { at: tablePath });
    // Ensure there's a paragraph after deletion
    Transforms.insertNodes(editor, {
      type: "paragraph",
      children: [{ text: "" }],
    });
  };

  return (
    <div {...attributes} className="my-4 relative">
      {selected && focused && (
        <div
          contentEditable={false}
          className="absolute -top-10 right-0 flex items-center gap-2 bg-white border rounded-md shadow-sm p-1"
        >
          <Button
            size="sm"
            variant="ghost"
            onMouseDown={(e) => e.preventDefault()}
            onClick={(e) => {
              e.preventDefault();
              addRow();
            }}
            className="text-xs"
          >
            + Row
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onMouseDown={(e) => e.preventDefault()}
            onClick={(e) => {
              e.preventDefault();
              deleteLastRow();
            }}
            className="text-xs"
          >
            - Row
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onMouseDown={(e) => e.preventDefault()}
            onClick={addColumn}
            className="text-xs"
          >
            + Col
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onMouseDown={(e) => e.preventDefault()}
            onClick={deleteLastColumn}
            className="text-xs"
          >
            - Col
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onMouseDown={(e) => e.preventDefault()}
            onClick={deleteTable}
            className="text-xs"
          >
            Delete
          </Button>
        </div>
      )}
      <table className="w-full border-collapse border border-gray-300">
        <tbody>{children}</tbody>
      </table>
    </div>
  );
};

const TableRowElement = ({ attributes, children }: RenderElementProps) => (
  <tr {...attributes} className="border border-gray-300">
    {children}
  </tr>
);

const TableCellElement = ({
  attributes,
  children,
  element,
}: RenderElementProps) => {
  const isHeader = (element as TableCellElement).header;
  return isHeader ? (
    <th
      {...attributes}
      className="border border-gray-300 bg-gray-100 px-3 py-2 text-left font-semibold"
    >
      {children}
    </th>
  ) : (
    <td {...attributes} className="border border-gray-300 px-3 py-2">
      {children}
    </td>
  );
};

// Element renderer from Slate demo
const Element = ({ attributes, children, element }: RenderElementProps) => {
  if (element.type === "image") {
    return (
      <ImageElement
        attributes={attributes}
        children={children}
        element={element}
      />
    );
  }

  if (element.type === "table") {
    return (
      <TableElement
        attributes={attributes}
        children={children}
        element={element}
      />
    );
  }

  if (element.type === "table-row") {
    return (
      <TableRowElement
        attributes={attributes}
        children={children}
        element={element}
      />
    );
  }

  if (element.type === "table-cell") {
    return (
      <TableCellElement
        attributes={attributes}
        children={children}
        element={element}
      />
    );
  }

  const style: React.CSSProperties = {};
  if (isAlignElement(element)) {
    style.textAlign = element.align as AlignType;
  }

  switch (element.type) {
    case "block-quote":
      return (
        <blockquote style={style} {...attributes}>
          {children}
        </blockquote>
      );
    case "bulleted-list":
      return (
        <ul style={style} {...attributes}>
          {children}
        </ul>
      );
    case "heading-one":
      return (
        <h1 style={style} {...attributes}>
          {children}
        </h1>
      );
    case "heading-two":
      return (
        <h2 style={style} {...attributes}>
          {children}
        </h2>
      );
    case "heading-three":
      return (
        <h3 style={style} {...attributes}>
          {children}
        </h3>
      );
    case "heading-four":
      return (
        <h4 style={style} {...attributes}>
          {children}
        </h4>
      );
    case "list-item":
      return (
        <li style={style} {...attributes}>
          {children}
        </li>
      );
    case "numbered-list":
      return (
        <ol style={style} {...attributes}>
          {children}
        </ol>
      );
    default:
      return (
        <p style={style} {...attributes}>
          {children}
        </p>
      );
  }
};

// Leaf renderer from Slate demo
const Leaf = ({ attributes, children, leaf }: RenderLeafProps) => {
  if (leaf.bold) {
    children = <strong>{children}</strong>;
  }

  if (leaf.code) {
    children = <code>{children}</code>;
  }

  if (leaf.italic) {
    children = <em>{children}</em>;
  }

  if (leaf.underline) {
    children = <u>{children}</u>;
  }

  if (leaf.link) {
    return (
      <a
        {...attributes}
        href={leaf.link}
        title={leaf.linkTitle}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 underline hover:text-blue-800"
      >
        {children}
      </a>
    );
  }

  return <span {...attributes}>{children}</span>;
};

// Button components
interface BlockButtonProps {
  format: CustomElementFormat;
  icon: React.ReactNode;
}

const BlockButton = ({ format, icon }: BlockButtonProps) => {
  const editor = useSlate();
  return (
    <Button
      variant="ghost"
      size="sm"
      className="h-8 w-8 p-0 data-[active=true]:bg-accent data-[active=true]:text-accent-foreground"
      data-active={isBlockActive(
        editor,
        format,
        isAlignType(format) ? "align" : "type"
      )}
      onPointerDown={(event: PointerEvent<HTMLButtonElement>) =>
        event.preventDefault()
      }
      onClick={() => toggleBlock(editor, format)}
    >
      {icon}
    </Button>
  );
};

interface MarkButtonProps {
  format: CustomTextKey;
  icon: React.ReactNode;
}

const MarkButton = ({ format, icon }: MarkButtonProps) => {
  const editor = useSlate();
  return (
    <Button
      variant="ghost"
      size="sm"
      className="h-8 w-8 p-0 data-[active=true]:bg-accent data-[active=true]:text-accent-foreground"
      data-active={isMarkActive(editor, format)}
      onPointerDown={(event: PointerEvent<HTMLButtonElement>) =>
        event.preventDefault()
      }
      onClick={() => toggleMark(editor, format)}
    >
      {icon}
    </Button>
  );
};

// Type guards
const isAlignType = (format: CustomElementFormat): format is AlignType => {
  return TEXT_ALIGN_TYPES.includes(format as AlignType);
};

const isListType = (format: CustomElementFormat): format is ListType => {
  return LIST_TYPES.includes(format as ListType);
};

const isAlignElement = (
  element: CustomElement
): element is CustomElement & { align: AlignType } => {
  return "align" in element && element.align !== undefined;
};

// HTML conversion functions
function htmlToSlate(html: string): Descendant[] {
  const div = document.createElement("div");
  div.innerHTML = html;

  const parseElement = (el: Element): CustomElement | null => {
    const tagName = el.tagName.toLowerCase();

    // Handle images
    if (tagName === "img") {
      const url = el.getAttribute("src") || "";
      const alt = el.getAttribute("alt") || "";
      return {
        type: "image",
        url,
        alt,
        children: [{ text: "" }],
      } as ImageElement;
    }

    // Handle tables
    if (tagName === "table") {
      const rows: TableRowElement[] = [];
      const tbody = el.querySelector("tbody") || el;
      const trElements = tbody.querySelectorAll("tr");

      trElements.forEach((trEl) => {
        const cells: TableCellElement[] = [];
        const cellElements = trEl.querySelectorAll("td, th");

        cellElements.forEach((cellEl) => {
          const isHeader = cellEl.tagName.toLowerCase() === "th";
          const text = cellEl.textContent || "";
          cells.push({
            type: "table-cell",
            header: isHeader,
            children: [{ text }],
          });
        });

        if (cells.length > 0) {
          rows.push({
            type: "table-row",
            children: cells,
          });
        }
      });

      // Don't add a default row if we have rows
      if (rows.length > 0) {
        return {
          type: "table",
          children: rows,
        } as TableElement;
      }

      // Only if completely empty, add one cell
      return {
        type: "table",
        children: [
          {
            type: "table-row",
            children: [
              {
                type: "table-cell",
                children: [{ text: "" }],
              } as TableCellElement,
            ],
          },
        ],
      } as TableElement;
    }

    // Handle linked images (a > img)
    if (tagName === "a") {
      const img = el.querySelector("img");
      if (img) {
        const url = img.getAttribute("src") || "";
        const alt = img.getAttribute("alt") || "";
        const link = el.getAttribute("href") || "";
        return {
          type: "image",
          url,
          alt,
          link,
          children: [{ text: "" }],
        } as ImageElement;
      }
    }

    const children: (CustomText | CustomElement)[] = [];

    for (const child of Array.from(el.childNodes)) {
      if (child.nodeType === Node.TEXT_NODE) {
        const text = child.textContent || "";
        if (text) {
          // Check if parent is an anchor for link
          if (el.tagName.toLowerCase() === "a") {
            const link = el.getAttribute("href");
            const title =
              el.getAttribute("title") ||
              el.getAttribute("aria-label") ||
              undefined;
            children.push({
              text,
              ...(link && { link }),
              ...(title && { linkTitle: title }),
            } as CustomText);
          } else {
            children.push({ text });
          }
        }
      } else if (child.nodeType === Node.ELEMENT_NODE) {
        const childEl = child as Element;
        const parsed = parseElement(childEl);
        if (parsed) children.push(parsed);
      }
    }

    if (children.length === 0) {
      children.push({ text: "" });
    }

    const textAlign = (el as HTMLElement).style.textAlign as
      | AlignType
      | undefined;

    switch (tagName) {
      case "h1":
        return {
          type: "heading-one",
          children: children as CustomText[],
          ...(textAlign && { align: textAlign }),
        };
      case "h2":
        return {
          type: "heading-two",
          children: children as CustomText[],
          ...(textAlign && { align: textAlign }),
        };
      case "h3":
        return {
          type: "heading-three",
          children: children as CustomText[],
          ...(textAlign && { align: textAlign }),
        };
      case "h4":
        return {
          type: "heading-four",
          children: children as CustomText[],
          ...(textAlign && { align: textAlign }),
        };
      case "blockquote":
        return {
          type: "block-quote",
          children: children as CustomText[],
          ...(textAlign && { align: textAlign }),
        };
      case "ul":
        return { type: "bulleted-list", children: children as CustomElement[] };
      case "ol":
        return { type: "numbered-list", children: children as CustomElement[] };
      case "li":
        return { type: "list-item", children: children as CustomText[] };
      case "tr":
        return { type: "table-row", children: children as TableCellElement[] };
      case "td":
      case "th":
        return {
          type: "table-cell",
          header: tagName === "th",
          children: children as CustomText[],
        };
      default:
        return {
          type: "paragraph",
          children: children as CustomText[],
          ...(textAlign && { align: textAlign }),
        };
    }
  };

  try {
    if (div.children.length === 0) {
      return [{ type: "paragraph", children: [{ text: html }] }];
    }

    return Array.from(div.children)
      .map(parseElement)
      .filter((el) => el !== null) as CustomElement[];
  } catch (e) {
    return [{ type: "paragraph", children: [{ text: html }] }];
  }
}

function slateToHtml(value: Descendant[]): string {
  const serialize = (node: any): string => {
    if (Text.isText(node)) {
      let string = node.text;
      if (node.bold) string = `<strong>${string}</strong>`;
      if (node.italic) string = `<em>${string}</em>`;
      if (node.underline) string = `<u>${string}</u>`;
      if (node.code) string = `<code>${string}</code>`;
      if (node.link) {
        const titleAttr = node.linkTitle ? ` title="${node.linkTitle}"` : "";
        string = `<a href="${node.link}"${titleAttr} target="_blank" rel="noopener noreferrer">${string}</a>`;
      }
      return string;
    }

    // Handle images
    if (node.type === "image") {
      const img = `<img src="${node.url}" alt="${
        node.alt || ""
      }" style="max-width: 100%; height: auto; max-height: 500px; border-radius: 0.5rem;" />`;

      if (node.link) {
        return `<div style="border: 2px solid #bfdbfe; border-radius: 0.5rem; padding: 0.75rem; background-color: #eff6ff; margin: 1rem 0;">
                    <a href="${node.link}" target="_blank" rel="noopener noreferrer" style="display: block; text-decoration: none;">
                        ${img}
                        <div style="margin-top: 0.5rem; font-size: 0.875rem; color: #2563eb;">
                            <span style="font-weight: 500;">🔗 Click to open:</span>
                            <span style="margin-left: 0.25rem;">${node.link}</span>
                        </div>
                    </a>
                </div>`;
      }

      return `<div style="margin: 1rem 0;">${img}</div>`;
    }

    // Handle tables
    if (node.type === "table") {
      const rows = node.children
        .map(
          (row: TableRowElement) =>
            `<tr>
            ${row.children
              .map((cell: TableCellElement) => {
                const content = cell.children
                  .map((child: any) => serialize(child))
                  .join("");
                return cell.header
                  ? `<th style="border: 1px solid #d1d5db; padding: 0.75rem; text-align: left; background-color: #f3f4f6; font-weight: 600;">${content}</th>`
                  : `<td style="border: 1px solid #d1d5db; padding: 0.75rem;">${content}</td>`;
              })
              .join("")}
          </tr>`
        )
        .join("");

      return `<table style="width: 100%; border-collapse: collapse; margin: 1rem 0;">
        <tbody>${rows}</tbody>
      </table>`;
    }

    const children = node.children.map(serialize).join("");
    const content = children.trim() === "" ? "&nbsp;" : children;
    const align = node.align ? ` style="text-align: ${node.align}"` : "";

    switch (node.type) {
      case "paragraph":
        return `<p${align}>${content}</p>`;
      case "heading-one":
        return `<h1${align}>${content}</h1>`;
      case "heading-two":
        return `<h2${align}>${content}</h2>`;
      case "heading-three":
        return `<h3${align}>${content}</h3>`;
      case "heading-four":
        return `<h4${align}>${content}</h4>`;
      case "block-quote":
        return `<blockquote${align}>${content}</blockquote>`;
      case "bulleted-list":
        return `<ul>${children}</ul>`;
      case "numbered-list":
        return `<ol>${children}</ol>`;
      case "list-item":
        return `<li>${content}</li>`;
      default:
        return children;
    }
  };

  return value.map(serialize).join("");
}
