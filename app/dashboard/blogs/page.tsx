"use client";

import { useState, useEffect } from "react";
import {
  Search,
  Filter,
  MoreHorizontal,
  Plus,
  PencilLine,
  StarOff,
  Star,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RiArrowLeftSLine, RiArrowRightSLine } from "react-icons/ri";
import { IoIosArrowDown } from "react-icons/io";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { DateRangeFilter } from "@/components/date-range-filter";
import { format } from "date-fns";
import { DeleteModal } from "@/components/delete-modal";
import Link from "next/link";
import { toast } from "@/components/ui/use-toast";
import { useContentStore } from "@/store/store";
import { Blog } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function BlogsPage() {
  const [activeTab, setActiveTab] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    blogSlug: string | null;
  }>({
    isOpen: false,
    blogSlug: null,
  });

  const [dateRange, setDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: undefined,
    to: undefined,
  });

  const { blogs, fetchBlogs, updateBlog, deleteBlog } = useContentStore();

  // Compare helper: ensure robust descending sort by dateCreated (newest first)
  const compareByDateDesc = (
    a: { dateCreated?: string },
    b: { dateCreated?: string }
  ) => {
    const ta = a?.dateCreated ? new Date(a.dateCreated).getTime() : 0;
    const tb = b?.dateCreated ? new Date(b.dateCreated).getTime() : 0;
    return tb - ta;
  };
  useEffect(() => {
    if (blogs.length === 0) {
      fetchBlogs()
        .catch(() => {
          toast({
            title: "Failed to fetch blogs",
            variant: "destructive",
          });
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const itemsPerPage = 10;

  const filteredData = blogs
    .filter((item) => {
      const matchesSearch = item.title
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesTab =
        activeTab === "All" ||
        item.status.toLowerCase() === activeTab.toLowerCase();

      // Date filter logic
      const matchesDate =
        !dateRange.from && !dateRange.to
          ? true
          : new Date(item.dateCreated) >= (dateRange.from || new Date(0)) &&
            new Date(item.dateCreated) <=
              (dateRange.to || new Date(8640000000000000));

      return matchesSearch && matchesTab && matchesDate;
    })
    .sort(compareByDateDesc);

  const handleDeleteClick = (blogSlug: string) => {
    setDeleteModal({ isOpen: true, blogSlug });
  };

  const handleDeleteConfirm = async () => {
    if (deleteModal.blogSlug) {
      try {
        await deleteBlog(deleteModal.blogSlug);
        toast({
          title: "Blog deleted successfully",
          variant: "default",
        });
        setDeleteModal({ isOpen: false, blogSlug: null });
      } catch (error) {
        toast({
          title: "Failed to delete blog",
          variant: "destructive",
        });
      }
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModal({ isOpen: false, blogSlug: null });
  };

  const handleMarkAsFeatured = async (slug: string, isFeatured: boolean) => {
    try {
      await updateBlog(slug, { isFeatured: !isFeatured });
      toast({
        title: `Blog ${
          !isFeatured ? "marked as featured" : "removed from featured"
        } successfully`,
        variant: "default",
      });
    } catch (error) {
      toast({
        title: "Failed to update featured status",
        variant: "destructive",
      });
    }
  };

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredData.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const renderPaginationButtons = () => {
    const buttons = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        buttons.push(
          <Button
            key={i}
            variant={currentPage === i ? "outline" : "ghost"}
            size="sm"
            className="h-8 w-8 p-0 bg-transparent"
            onClick={() => handlePageChange(i)}
          >
            {i}
          </Button>
        );
      }
    } else {
      buttons.push(
        <Button
          key={1}
          variant={currentPage === 1 ? "outline" : "ghost"}
          size="sm"
          className="h-8 w-8 p-0 bg-transparent"
          onClick={() => handlePageChange(1)}
        >
          1
        </Button>
      );

      if (currentPage > 3) {
        buttons.push(
          <span key="ellipsis1" className="text-muted-foreground">
            ...
          </span>
        );
      }

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        buttons.push(
          <Button
            key={i}
            variant={currentPage === i ? "outline" : "ghost"}
            size="sm"
            className="h-8 w-8 p-0 bg-transparent"
            onClick={() => handlePageChange(i)}
          >
            {i}
          </Button>
        );
      }

      if (currentPage < totalPages - 2) {
        buttons.push(
          <span key="ellipsis2" className="text-muted-foreground">
            ...
          </span>
        );
      }

      if (totalPages > 1) {
        buttons.push(
          <Button
            key={totalPages}
            variant={currentPage === totalPages ? "outline" : "ghost"}
            size="sm"
            className="h-8 w-8 p-0 bg-transparent"
            onClick={() => handlePageChange(totalPages)}
          >
            {totalPages}
          </Button>
        );
      }
    }

    return buttons;
  };

  if (loading) {
    return (
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-[300px]" />
          <Skeleton className="h-10 w-[120px]" />
        </div>

        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-[200px] mb-2" />
            <Skeleton className="h-4 w-[300px]" />
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Skeleton className="h-4 w-[100px]" />
              <Skeleton className="h-10 w-full" />
            </div>

            <Skeleton className="h-24 w-full" />

            <div className="space-y-2">
              <Skeleton className="h-4 w-[150px]" />
              <Skeleton className="h-10 w-full" />
            </div>

            <div className="space-y-2">
              <Skeleton className="h-4 w-[150px]" />
              <Skeleton className="h-10 w-full" />
            </div>

            <div className="flex justify-end space-x-2">
              <Skeleton className="h-10 w-[100px]" />
              <Skeleton className="h-10 w-[150px]" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 md:px-10">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Blogs</h1>
      </div>

      <div className="flex items-center gap-3">
        <Button
          variant={activeTab === "All" ? "default" : "outline"}
          onClick={() => setActiveTab("All")}
          className={
            activeTab === "All"
              ? "bg-orange-100 text-primary border border-primary px-8 rounded-2xl hover:bg-primary/50 hover:text-white"
              : "bg-transparent rounded-2xl px-8"
          }
        >
          All
        </Button>
        <Button
          variant={activeTab === "Published" ? "default" : "outline"}
          onClick={() => setActiveTab("Published")}
          className={
            activeTab === "Published"
              ? "bg-orange-100 text-primary border border-primary rounded-2xl hover:bg-primary/50 hover:text-white"
              : "bg-transparent rounded-2xl"
          }
        >
          Published
        </Button>
        <Button
          variant={activeTab === "Draft" ? "default" : "outline"}
          onClick={() => setActiveTab("Draft")}
          className={
            activeTab === "Draft"
              ? "bg-orange-100 text-primary border border-primary rounded-2xl hover:bg-primary/50 hover:text-white"
              : "bg-transparent rounded-2xl"
          }
        >
          Draft
        </Button>
      </div>

      <div className="md:flex grid grid-cols-1 items-center justify-between gap-4">
        <div className="flex items-center gap-4 flex-1">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
            <Input
              placeholder="Search for blogs by title"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 rounded-3xl bg-gray-100 border-none focus-visible:ring-0 focus-visible:ring-offset-0"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="gap-2 bg-transparent rounded-lg"
              >
                <Filter className="h-4 w-4" />
                Filter
                <IoIosArrowDown className="w-4 h-4" />
                {(dateRange.from || dateRange.to) && (
                  <span className="ml-1 text-xs bg-app-primary text-white px-2 py-1 rounded-full">
                    {dateRange.from ? format(dateRange.from, "MM/dd") : ""}
                    {dateRange.from && dateRange.to ? " - " : ""}
                    {dateRange.to ? format(dateRange.to, "MM/dd") : ""}
                  </span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-4" align="start">
              <div className="space-y-4">
                <h4 className="font-medium">Filter by Date</h4>
                <DateRangeFilter
                  fromDate={dateRange.from}
                  toDate={dateRange.to}
                  onDateRangeChange={(from, to) => setDateRange({ from, to })}
                />
              </div>
            </PopoverContent>
          </Popover>

          <Button
            className="gap-2 bg-app-primary hover:bg-primary/90 rounded-lg"
            asChild
          >
            <Link href="/dashboard/blogs/create">
              <Plus className="h-4 w-4" />
              Create Blog
            </Link>
          </Button>
        </div>
      </div>

      <div className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground w-[100px] rounded-l-xl">
                  Blog ID
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                  Blog Title
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                  Author
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground w-[120px]">
                  Date Created
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground w-[100px]">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground w-[120px]">
                  Last Updated
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground w-[80px]">
                  Action
                </th>
                <th className="px-4 py-3 w-[50px] rounded-r-xl"></th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <p className="text-muted-foreground text-lg mb-2">
                        No blogs found
                      </p>
                      <p className="text-muted-foreground text-sm">
                        {searchQuery ||
                        dateRange.from ||
                        dateRange.to ||
                        activeTab !== "All"
                          ? "Try adjusting your filters or search terms"
                          : "Create your first blog to get started"}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedData.map((item: Blog) => (
                  <tr key={item.slug} className="border-b last:border-0">
                    <td className="px-4 py-4 text-sm text-muted-foreground">
                      #{item.id}
                    </td>
                    <td className="px-4 py-4 text-sm font-medium">
                      {item.title}
                    </td>
                    <td className="px-4 py-4 text-sm text-muted-foreground">
                      {item.author}
                    </td>
                    <td className="px-4 py-4 text-sm text-muted-foreground">
                      {new Date(item.dateCreated).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-4 py-4 text-sm">
                      <div
                        className={`inline-flex items-center gap-2 px-3 py-1 rounded-xl font-medium ${
                          item.status === "published"
                            ? "bg-green-100 text-green-700"
                            : "bg-orange-100 text-orange-700"
                        }`}
                      >
                        <span
                          className={`h-2 w-2 rounded-full ${
                            item.status === "published"
                              ? "bg-green-500"
                              : "bg-orange-500"
                          }`}
                        />
                        <span>
                          {item.status.charAt(0).toUpperCase() +
                            item.status.slice(1)}
                        </span>
                      </div>
                    </td>

                    <td className="px-4 py-4 text-sm text-muted-foreground">
                      {new Date(item.lastUpdated).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-4 py-4 text-sm">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-primary hover:text-primary h-auto p-0"
                        asChild
                      >
                        <Link href={`/dashboard/blogs/${item.slug}/view`}>
                          <p className="border rounded-lg py-2 px-3"> View </p>
                        </Link>
                      </Button>
                    </td>
                    <td className="px-4 py-4">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/dashboard/blogs/${item.slug}/edit`}>
                              <PencilLine className="h-4 w-4" /> Edit Blog
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              handleMarkAsFeatured(
                                item.slug,
                                item.isFeatured as boolean
                              )
                            }
                            className="flex items-center gap-2"
                          >
                            {item.isFeatured ? (
                              <>
                                <StarOff className="h-4 w-4" />
                                Remove as Featured
                              </>
                            ) : (
                              <>
                                <Star className="h-4 w-4" />
                                Mark as Featured
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => handleDeleteClick(item.slug)}
                          >
                            <Trash2 className="h-4 w-4" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          className="gap-2 rounded-lg border"
          onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
        >
          <RiArrowLeftSLine /> Back
        </Button>

        <div className="flex items-center gap-2">
          {renderPaginationButtons()}
        </div>

        <Button
          variant="ghost"
          className="gap-2 rounded-lg border"
          onClick={() =>
            handlePageChange(Math.min(totalPages, currentPage + 1))
          }
          disabled={currentPage === totalPages}
        >
          Next <RiArrowRightSLine />
        </Button>
      </div>

      <DeleteModal
        isOpen={deleteModal.isOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Delete Blog"
        description="Are you sure you want to delete this blog?"
        itemType="blog"
      />
    </div>
  );
}
