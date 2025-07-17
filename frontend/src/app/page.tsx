"use client";

import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { DateRange } from "react-day-picker";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, Pencil, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { TodoForm, formSchema, FormSchemaType } from "@/components/TodoForm";
import * as z from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Todo {
  _id: string;
  title: string;
  description: string;
  category: string;
  status: string;
  createdAt: string;
  modifiedAt: string;
}

interface Pagination {
  total: number;
  page: number;
  limit: number;
  next?: {
    page: number;
    limit: number;
  };
  prev?: {
    page: number;
    limit: number;
  };
}

export default function Home() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState<string[]>([]);
  const [date, setDate] = useState<DateRange | undefined>();
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<Pagination>({ total: 0, page: 1, limit: 5 });
  const [isCreateDialogOpen, setCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedTodo, setSelectedTodo] = useState<Todo | null>(null);
  const [selectedTodoIds, setSelectedTodoIds] = useState<string[]>([]);
  const slogans = [
    "Your Goals, Our Priority",
    "Achieve More, Stress Less",
    "Organize Your Life, One Task at a Time",
    "Productivity Starts Here",
    "Simplify Your Day"
  ];
  const [currentSloganIndex, setCurrentSloganIndex] = useState(0);

  const fetchTodos = async () => {
    const params = new URLSearchParams();
    if (search) params.append("search", search);
    if (category) params.append("category", category);
    if (status.length > 0) params.append("status", status.join(","));
    if (date?.from) params.append("start_date", date.from.toISOString());
    if (date?.to) params.append("end_date", date.to.toISOString());
    params.append("page", page.toString());
    params.append("limit", "5");

    try {
      const res = await fetch(`https://todobackend-upk1.onrender.com/api/v1/todos?${params.toString()}`);
      const data = await res.json();
      setTodos(data.data);
      setPagination(data.pagination);
    } catch (error) {
      console.error("Error fetching todos:", error);
    }
  };

  useEffect(() => {
    fetchTodos();
  }, [search, category, status, date, page, fetchTodos]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSloganIndex((prevIndex) => (prevIndex + 1) % slogans.length);
    }, 5000); // Change slogan every 5 seconds
    return () => clearInterval(interval);
  }, [slogans.length]);

  const handleCreate = async (values: z.infer<typeof formSchema>) => {
    console.log("Creating TODO with values:", values);
    try {
      await fetch("https://todobackend-upk1.onrender.com/api/v1/todos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
    } catch (error) {
      console.error("Error creating todo:", error);
    }
    await fetchTodos();
    setCreateDialogOpen(false);
  };

  const handleUpdate = async (values: z.infer<typeof formSchema>) => {
    if (!selectedTodo) return;
    try {
      await fetch(`https://todobackend-upk1.onrender.com/api/v1/todos/${selectedTodo._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
    } catch (error) {
      console.error("Error updating todo:", error);
    }
    await fetchTodos();
    setEditDialogOpen(false);
    setSelectedTodo(null);
  };

  const handleMarkAsCompleted = async (id: string) => {
    try {
      await fetch(`https://todobackend-upk1.onrender.com/api/v1/todos/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "Completed" }),
      });
      await fetchTodos();
    } catch (error) {
      console.error("Error marking todo as completed:", error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch(`https://todobackend-upk1.onrender.com/api/v1/todos/${id}`, {
        method: "DELETE",
      });
      await fetchTodos();
    } catch (error) {
      console.error("Error deleting todo:", error);
    }
  };

  const handleMarkAsIncomplete = async (id: string) => {
    try {
      await fetch(`https://todobackend-upk1.onrender.com/api/v1/todos/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "Not Started" }), // Or "Pending", depending on desired incomplete state
      });
      await fetchTodos();
    } catch (error) {
      console.error("Error marking todo as incomplete:", error);
    }
  };

  const handleCheckboxChange = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedTodoIds((prev) => [...prev, id]);
    } else {
      setSelectedTodoIds((prev) => prev.filter((todoId) => todoId !== id));
    }
  };

  const handleBulkDelete = async () => {
    try {
      await Promise.all(selectedTodoIds.map((id) =>
        fetch(`https://todobackend-upk1.onrender.com/api/v1/todos/${id}`, {
          method: "DELETE",
        })
      ));
      setSelectedTodoIds([]);
      await fetchTodos();
    } catch (error) {
      console.error("Error deleting selected todos:", error);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="bg-gradient-to-r from-blue-600 to-purple-700 text-white py-6 px-4 shadow-lg">
        <div className="mx-auto text-center">
          <h1 className="text-4xl font-extrabold tracking-tight">{slogans[currentSloganIndex]}</h1>
        </div>
      </header>
      <main className="flex-grow flex items-center justify-center p-6">
        <Card className="w-full max-w-full rounded-xl shadow-2xl bg-white">
          <CardHeader className="border-b pb-4">
            <CardTitle className="text-3xl font-bold text-gray-800">My ToDo List</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="flex flex-col gap-6 mb-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-4">
                  <Input
                    placeholder="Search..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-64 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-md shadow-sm"
                  />
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger className="w-[180px] border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-md shadow-sm">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Homework">Homework</SelectItem>
                      <SelectItem value="Office Work">Office Work</SelectItem>
                    </SelectContent>
                  </Select>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        id="date"
                        variant={"outline"}
                        className={cn(
                          "w-[300px] justify-start text-left font-normal border-gray-300 hover:bg-gray-50 rounded-md shadow-sm",
                          !date && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4 text-gray-600" />
                        {date?.from ? (
                          date.to ? (
                            <>
                              {format(date.from, "LLL dd, y")} -{" "}
                              {format(date.to, "LLL dd, y")}
                            </>
                          ) : (
                            format(date.from, "LLL dd, y")
                          )
                        ) : (
                          <span className="text-gray-500">Pick a date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 bg-white border border-gray-200 rounded-md shadow-lg" align="start">
                      <Calendar
                        initialFocus
                        mode="range"
                        defaultMonth={date?.from}
                        selected={date}
                        onSelect={setDate}
                        numberOfMonths={2}
                      />
                    </PopoverContent>
                  </Popover>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearch("");
                      setCategory("");
                      setStatus([]);
                      setDate(undefined);
                      setPage(1);
                    }}
                    className="border-gray-300 hover:bg-gray-50 text-gray-700 rounded-md shadow-sm"
                  >
                    Reset Filters
                  </Button>
                </div>
                <Dialog open={isCreateDialogOpen} onOpenChange={setCreateDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg shadow-md transition-all duration-200 ease-in-out transform hover:scale-105">Create TODO</Button>
                  </DialogTrigger>
                  <DialogContent className="bg-white rounded-lg shadow-xl">
                    <DialogHeader>
                      <DialogTitle className="text-2xl font-bold text-gray-800">Create New TODO</DialogTitle>
                    </DialogHeader>
                    <TodoForm onSubmit={handleCreate} />
                  </DialogContent>
                </Dialog>
              </div>
              <div className="flex flex-wrap justify-center gap-6 p-4 bg-gray-50 rounded-lg shadow-inner">
                <div className="flex items-center space-x-2">
                  <Checkbox id="not-started" checked={status.includes("Not Started")} onCheckedChange={(checked) => {
                    if (checked) {
                      setStatus([...status, "Not Started"]);
                    } else {
                      setStatus(status.filter((s) => s !== "Not Started"));
                    }
                  }} className="text-blue-500 focus:ring-blue-500" />
                  <label htmlFor="not-started" className="text-gray-700 font-medium">Not Started</label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="pending" checked={status.includes("Pending")} onCheckedChange={(checked) => {
                    if (checked) {
                      setStatus([...status, "Pending"]);
                    } else {
                      setStatus(status.filter((s) => s !== "Pending"));
                    }
                  }} className="text-yellow-500 focus:ring-yellow-500" />
                  <label htmlFor="pending" className="text-gray-700 font-medium">Pending</label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="completed" checked={status.includes("Completed")} onCheckedChange={(checked) => {
                    if (checked) {
                      setStatus([...status, "Completed"]);
                    } else {
                      setStatus(status.filter((s) => s !== "Completed"));
                    }
                  }} className="text-green-500 focus:ring-green-500" />
                  <label htmlFor="completed" className="text-gray-700 font-medium">Completed</label>
                </div>
              </div>
            </div>
            <Table className="min-w-full bg-white border border-gray-200 rounded-lg overflow-hidden shadow-md">
              <TableHeader className="bg-gray-100">
                <TableRow className="border-b border-gray-200">
                  <TableHead className="w-[50px] px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    <Checkbox
                      checked={selectedTodoIds.length === todos.length && todos.length > 0}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedTodoIds(todos.map((todo) => todo._id));
                        } else {
                          setSelectedTodoIds([]);
                        }
                      }}
                      className="text-blue-500 focus:ring-blue-500"
                    />
                  </TableHead>
                  <TableHead className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Title</TableHead>
                  <TableHead className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Description</TableHead>
                  <TableHead className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Category</TableHead>
                  <TableHead className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</TableHead>
                  <TableHead className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Created At</TableHead>
                  <TableHead className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Modified At</TableHead>
                  <TableHead className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-100">
                {todos.map((todo) => (
                  <TableRow key={todo._id} className="hover:bg-gray-50 transition-colors duration-150 ease-in-out">
                    <TableCell className="px-4 py-4 whitespace-nowrap">
                      <Checkbox
                        checked={selectedTodoIds.includes(todo._id)}
                        onCheckedChange={(checked) => handleCheckboxChange(todo._id, checked as boolean)}
                        className="text-blue-500 focus:ring-blue-500"
                      />
                    </TableCell>
                    <TableCell className="px-4 py-4 text-sm font-medium text-gray-900 break-words">{todo.title}</TableCell>
                    <TableCell className="px-4 py-4 text-sm text-gray-600 break-words">{todo.description}</TableCell>
                    <TableCell className="px-4 py-4 text-sm text-gray-600">{todo.category}</TableCell>
                    <TableCell className="px-4 py-4 text-sm text-gray-600">{todo.status}</TableCell>
                    <TableCell className="px-4 py-4 text-sm text-gray-600">{new Date(todo.createdAt).toLocaleString()}</TableCell>
                    <TableCell className="px-4 py-4 text-sm text-gray-600">{new Date(todo.modifiedAt).toLocaleString()}</TableCell>
                    <TableCell className="px-4 py-4 text-right text-sm font-medium flex space-x-2 justify-end">
                      <Dialog open={isEditDialogOpen && selectedTodo?._id === todo._id} onOpenChange={(isOpen) => {
                        if (!isOpen) {
                          setEditDialogOpen(false);
                          setSelectedTodo(null);
                        } else {
                          setEditDialogOpen(true);
                          setSelectedTodo(todo);
                        }
                      }}>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="icon" className="text-blue-600 hover:text-blue-800 border-blue-600 hover:border-blue-800 rounded-full p-2 shadow-sm hover:shadow-md transition-all duration-200">
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-white rounded-lg shadow-xl">
                          <DialogHeader>
                            <DialogTitle className="text-2xl font-bold text-gray-800">Edit TODO</DialogTitle>
                          </DialogHeader>
                          <TodoForm onSubmit={handleUpdate} initialData={selectedTodo} />
                        </DialogContent>
                      </Dialog>
                      <Button variant="outline" size="icon" onClick={() => handleDelete(todo._id)} className="text-red-600 hover:text-red-800 border-red-600 hover:border-red-800 rounded-full p-2 shadow-sm hover:shadow-md transition-all duration-200">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      {todo.status !== "Completed" ? (
                        <Button variant="outline" size="sm" onClick={() => handleMarkAsCompleted(todo._id)} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md shadow-sm transition-all duration-200">
                          Mark as Completed
                        </Button>
                      ) : (
                        status.includes("Completed") && (
                          <Button variant="outline" size="sm" onClick={() => handleMarkAsIncomplete(todo._id)} className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-md shadow-sm transition-all duration-200">
                            Mark as Incomplete
                          </Button>
                        )
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="flex justify-between items-center mt-6 p-4 bg-gray-50 rounded-lg shadow-inner">
              <Button
                disabled={!pagination.prev}
                onClick={() => setPage(pagination.prev.page)}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-md shadow-sm transition-all duration-200"
              >
                Previous
              </Button>
              <Button
                onClick={handleBulkDelete}
                disabled={selectedTodoIds.length === 0}
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg shadow-md transition-all duration-200 ease-in-out transform hover:scale-105"
              >
                Delete Selected ({selectedTodoIds.length})
              </Button>
              <span className="text-gray-700 font-medium">
                Page {page} of {Math.ceil(pagination.total / 5) || 1}
              </span>
              <Button
                disabled={!pagination.next}
                onClick={() => setPage(pagination.next.page)}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-md shadow-sm transition-all duration-200"
              >
                Next
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
      <footer className="bg-gray-900 text-white p-4 text-center shadow-inner">
        <p className="text-sm opacity-80">&copy; {new Date().getFullYear()} TODO App. All rights reserved.</p>
      </footer>
    </div>
  );
}
