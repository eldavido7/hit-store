"use client"

import { useState, useEffect } from "react"
import { Search, Filter, MoreHorizontal, Plus, PencilLine, StarOff, Star, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { DateRangeFilter } from "@/components/date-range-filter"
import { DeleteModal } from "@/components/delete-modal"
import { CreateEventModal } from "@/components/create-event-modal"
import { EditEventModal } from "@/components/edit-event-modal"
import { useEventStore } from "@/store/store"
import { toast } from "@/components/ui/use-toast"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { IoIosArrowDown } from "react-icons/io"
import { RiArrowLeftSLine, RiArrowRightSLine } from "react-icons/ri"

export default function EventsPage() {
  const { events, fetchEvents, updateEvent, deleteEvent } = useEventStore()
  const [activeTab, setActiveTab] = useState("All")
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; eventSlug: string | null }>({
    isOpen: false,
    eventSlug: null,
  })
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined,
  })
  const [createModal, setCreateModal] = useState(false)
  const [editModal, setEditModal] = useState<{ isOpen: boolean; eventSlug: string | null }>({
    isOpen: false,
    eventSlug: null,
  })
  const itemsPerPage = 10

  useEffect(() => {
    if (events.length === 0) {
      fetchEvents()
        .catch(() => {
          toast({
            title: "Failed to fetch events",
            variant: "destructive",
          })
        })
        .finally(() => {
          setLoading(false)
        })
    } else {
      setLoading(false)
    }
  }, [])

  const filteredData = events.filter((item) => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesTab = activeTab === "All" || item.status.toLowerCase() === activeTab.toLowerCase()
    const matchesDate = !dateRange.from && !dateRange.to
      ? true
      : new Date(item.date) >= (dateRange.from || new Date(0)) &&
      new Date(item.date) <= (dateRange.to || new Date(8640000000000000))
    return matchesSearch && matchesTab && matchesDate
  })

  const handleDeleteClick = (eventSlug: string) => {
    setDeleteModal({ isOpen: true, eventSlug })
  }

  const handleDeleteConfirm = async () => {
    if (deleteModal.eventSlug) {
      try {
        await deleteEvent(deleteModal.eventSlug)
        toast({ title: "Event deleted successfully", variant: "default" })
      } catch (error) {
        toast({ title: "Failed to delete event", variant: "destructive" })
      } finally {
        setDeleteModal({ isOpen: false, eventSlug: null })
      }
    }
  }

  const handleDeleteCancel = () => {
    setDeleteModal({ isOpen: false, eventSlug: null })
  }

  const handleEditClick = (eventSlug: string) => {
    setEditModal({ isOpen: true, eventSlug })
  }

  const handleEditClose = () => {
    setEditModal({ isOpen: false, eventSlug: null })
  }

  const handleMarkAsFeatured = async (eventSlug: string) => {
    try {
      const event = events.find((e) => e.slug === eventSlug)
      if (event) {
        await updateEvent(eventSlug, { featured: !event.featured })
        toast({
          title: `Event ${!event.featured ? "marked as featured" : "removed from featured"} successfully`,
          variant: "default",
        })
      }
    } catch (error) {
      toast({ title: "Failed to update featured status", variant: "destructive" })
    }
  }

  const totalPages = Math.ceil(filteredData.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage)

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const renderPaginationButtons = () => {
    const buttons = []
    const maxVisiblePages = 5

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
          </Button>,
        )
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
        </Button>,
      )

      if (currentPage > 3) {
        buttons.push(
          <span key="ellipsis1" className="text-muted-foreground">
            ...
          </span>,
        )
      }

      const start = Math.max(2, currentPage - 1)
      const end = Math.min(totalPages - 1, currentPage + 1)

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
          </Button>,
        )
      }

      if (currentPage < totalPages - 2) {
        buttons.push(
          <span key="ellipsis2" className="text-muted-foreground">
            ...
          </span>,
        )
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
          </Button>,
        )
      }
    }

    return buttons
  }

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
        <h1 className="text-2xl font-semibold text-foreground">Events</h1>
      </div>

      <div className="flex items-center gap-3">
        <Button
          variant={activeTab === "All" ? "default" : "outline"}
          onClick={() => setActiveTab("All")}
          className={activeTab === "All" ? "bg-orange-100 text-primary border border-primary px-8 rounded-2xl hover:bg-primary/50 hover:text-white" : "bg-transparent rounded-2xl px-8"}
        >
          All
        </Button>
        <Button
          variant={activeTab === "Active" ? "default" : "outline"}
          onClick={() => setActiveTab("Active")}
          className={activeTab === "Active" ? "bg-orange-100 text-primary border border-primary rounded-2xl hover:bg-primary/50 hover:text-white" : "bg-transparent rounded-2xl"}
        >
          Active
        </Button>
        <Button
          variant={activeTab === "Ended" ? "default" : "outline"}
          onClick={() => setActiveTab("Ended")}
          className={activeTab === "Ended" ? "bg-orange-100 text-primary border border-primary rounded-2xl hover:bg-primary/50 hover:text-white" : "bg-transparent rounded-2xl"}
        >
          Ended
        </Button>
      </div>

      <div className="md:flex grid grid-cols-1 items-center justify-between gap-4">
        <div className="flex items-center gap-4 flex-1">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
            <Input
              placeholder="Search for events by title"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 rounded-3xl bg-gray-100 border-none focus-visible:ring-0 focus-visible:ring-offset-0"
            />
          </div>


        </div>

        <div className="flex items-center justify-end gap-3">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="gap-2 bg-transparent rounded-lg">
                <Filter className="h-4 w-4" />
                Filter
                <IoIosArrowDown className="w-4 h-4" />
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

          <Button className="gap-2 bg-primary rounded-lg hover:bg-primary/90" onClick={() => setCreateModal(true)}>
            <Plus className="h-4 w-4" />
            Create Event
          </Button>
        </div>
      </div>

      <div className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground w-[100px] rounded-l-xl">
                  Event ID
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                  Event Title
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground w-[120px]">
                  Date Created
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground w-[100px]">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground w-[120px]">
                  Date
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
                  <td colSpan={7} className="px-4 py-8 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <p className="text-muted-foreground text-lg mb-2">No events found</p>
                      <p className="text-muted-foreground text-sm">
                        {searchQuery || dateRange.from || dateRange.to || activeTab !== "All"
                          ? "Try adjusting your filters or search terms"
                          : "Create your first event to get started"}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedData.map((item) => (
                  <tr key={item.slug} className="border-b last:border-0">
                    <td className="px-4 py-4 text-sm text-muted-foreground">#{item.id}</td>
                    <td className="px-4 py-4 text-sm font-medium">{item.title}</td>
                    <td className="px-4 py-4 text-sm text-muted-foreground">
                      {new Date(item.dateCreated).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-4 py-4 text-sm">
                      <div
                        className={`inline-flex items-center gap-2 px-3 py-1 rounded-xl font-medium ${item.status === "active"
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-700"
                          }`}
                      >
                        <span
                          className={`h-2 w-2 rounded-full ${item.status === "active" ? "bg-green-500" : "bg-gray-500"
                            }`}
                        />
                        <span>{item.status.charAt(0).toUpperCase() + item.status.slice(1)}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-muted-foreground">
                      {new Date(item.date).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      })}
                    </td>

                    <td className="px-4 py-4">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEditClick(item.slug)}>
                            <PencilLine className="h-4 w-4" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleMarkAsFeatured(item.slug)}
                            className="flex items-center gap-2"
                          >
                            {item.featured ? (
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

        <div className="flex items-center gap-2">{renderPaginationButtons()}</div>

        <Button
          variant="ghost"
          className="gap-2 rounded-lg border"
          onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
        >
          Next <RiArrowRightSLine />
        </Button>
      </div>

      <DeleteModal
        isOpen={deleteModal.isOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Delete Event"
        description="Are you sure you want to delete this event?"
        itemType="event"
      />

      <CreateEventModal
        isOpen={createModal}
        onClose={() => setCreateModal(false)}
        onEventCreated={() => {
          fetchEvents()
          setCreateModal(false)
          toast({ title: "Event created successfully", variant: "default" })
        }}
      />

      <EditEventModal
        isOpen={editModal.isOpen}
        eventSlug={editModal.eventSlug}
        events={events}
        onClose={handleEditClose}
        onEventUpdated={() => {
          fetchEvents()
          handleEditClose()
          toast({ title: "Event updated successfully", variant: "default" })
        }}
      />
    </div>
  )
}
