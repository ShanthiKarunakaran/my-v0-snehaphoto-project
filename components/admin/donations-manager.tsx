"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { CheckCircle2, AlertCircle, Loader2, Plus, Edit2, Trash2, DollarSign, Upload } from "lucide-react"
import type { Donation } from "@/lib/supabase"

export function DonationsManager() {
  const [donations, setDonations] = useState<Donation[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [status, setStatus] = useState<{ type: "success" | "error" | null; message: string }>({
    type: null,
    message: "",
  })
  const [editingId, setEditingId] = useState<number | null>(null)
  const [importFile, setImportFile] = useState<File | null>(null)

  // Form state
  const [formData, setFormData] = useState({
    donor_name: "",
    amount: "",
    payment_method: "",
    note: "",
    transaction_date: "",
    is_donation: true,
    order_description: "",
    photoshoot_type: "",
  })

  // Fetch donations on mount
  useEffect(() => {
    fetchDonations()
  }, [])

  const fetchDonations = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/donations")
      const data = await response.json()

      if (response.ok) {
        setDonations(data.donations || [])
      } else {
        setStatus({ type: "error", message: data.error || "Failed to fetch donations" })
      }
    } catch (error) {
      setStatus({ type: "error", message: "Failed to connect to server" })
    } finally {
      setIsLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      donor_name: "",
      amount: "",
      payment_method: "",
      note: "",
      transaction_date: "",
      is_donation: true,
      order_description: "",
      photoshoot_type: "",
    })
    setEditingId(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setStatus({ type: null, message: "" })

    try {
      const payload = {
        ...formData,
        amount: parseFloat(formData.amount),
        transaction_date: formData.transaction_date || null,
        payment_method: formData.payment_method || null,
        note: formData.note || null,
        order_description: formData.order_description || null,
        photoshoot_type: formData.photoshoot_type || null,
      }

      const url = editingId ? `/api/donations/${editingId}` : "/api/donations"
      const method = editingId ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (response.ok) {
        setStatus({
          type: "success",
          message: editingId
            ? "Donation updated successfully!"
            : "Donation added successfully!",
        })
        resetForm()
        fetchDonations()
      } else {
        setStatus({ type: "error", message: data.error || "Failed to save donation" })
      }
    } catch (error) {
      setStatus({ type: "error", message: "Failed to connect to server" })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = (donation: Donation) => {
    setFormData({
      donor_name: donation.donor_name,
      amount: donation.amount.toString(),
      payment_method: donation.payment_method || "",
      note: donation.note || "",
      transaction_date: donation.transaction_date
        ? new Date(donation.transaction_date).toISOString().split("T")[0]
        : "",
      is_donation: donation.is_donation,
      order_description: donation.order_description || "",
      photoshoot_type: donation.photoshoot_type || "",
    })
    setEditingId(donation.id)
    // Scroll to form
    document.getElementById("donation-form")?.scrollIntoView({ behavior: "smooth" })
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this donation?")) {
      return
    }

    try {
      const response = await fetch(`/api/donations/${id}`, {
        method: "DELETE",
      })

      const data = await response.json()

      if (response.ok) {
        setStatus({ type: "success", message: "Donation deleted successfully!" })
        fetchDonations()
      } else {
        setStatus({ type: "error", message: data.error || "Failed to delete donation" })
      }
    } catch (error) {
      setStatus({ type: "error", message: "Failed to connect to server" })
    }
  }

  const handleImportCSV = async () => {
    if (!importFile) {
      setStatus({ type: "error", message: "Please select a CSV file first" })
      return
    }

    setIsImporting(true)
    setStatus({ type: null, message: "" })

    try {
      const formData = new FormData()
      formData.append("file", importFile)

      const response = await fetch("/api/donations/import", {
        method: "POST",
        body: formData,
      })

      const data = await response.json()

      if (response.ok) {
        setStatus({
          type: "success",
          message: `Successfully imported ${data.imported} donation${data.imported !== 1 ? "s" : ""}!${data.errors && data.errors.length > 0 ? ` (${data.errors.length} errors - check console)` : ""}`,
        })
        setImportFile(null)
        // Reset file input
        const fileInput = document.getElementById("csv-import-input") as HTMLInputElement
        if (fileInput) fileInput.value = ""
        fetchDonations()
        
        if (data.errors && data.errors.length > 0) {
          console.error("Import errors:", data.errors)
        }
      } else {
        setStatus({ 
          type: "error", 
          message: data.error || "Failed to import CSV file" + (data.headers ? ` (Headers found: ${data.headers.join(", ")})` : "")
        })
      }
    } catch (error) {
      setStatus({ type: "error", message: "Failed to connect to server" })
    } finally {
      setIsImporting(false)
    }
  }

  // Calculate total
  const totalAmount = donations
    .filter((d) => d.is_donation)
    .reduce((sum, d) => sum + d.amount, 0)

  return (
    <div className="space-y-6">
      {/* Total Summary */}
      <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg p-4 border border-primary/20">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Total Donations</p>
            <p className="text-3xl font-bold text-primary mt-1">
              ${Math.round(totalAmount * 100) / 100}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {donations.filter((d) => d.is_donation).length} donation
              {donations.filter((d) => d.is_donation).length !== 1 ? "s" : ""}
            </p>
          </div>
          <DollarSign className="h-12 w-12 text-primary/30" />
        </div>
      </div>

      {/* Status Message */}
      {status.message && (
        <div
          className={`flex items-center gap-2 p-3 rounded-lg ${
            status.type === "success"
              ? "bg-green-500/10 text-green-700 dark:text-green-400 border border-green-500/20"
              : "bg-destructive/10 text-destructive border border-destructive/20"
          }`}
        >
          {status.type === "success" ? (
            <CheckCircle2 className="h-4 w-4" />
          ) : (
            <AlertCircle className="h-4 w-4" />
          )}
          <p className="text-sm">{status.message}</p>
        </div>
      )}

      {/* CSV Import Section */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-4">Import from CSV</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Import existing donations from your spreadsheet. Export your spreadsheet as CSV and upload it here.
          <br />
          <span className="font-medium">Expected columns:</span> Who ordered, Amount collected, Donated?, Mode of payment, Note, Transaction Date, What was ordered, Photoshoot type
        </p>
        <div className="flex gap-3 items-end">
          <div className="flex-1">
            <label htmlFor="csv-import-input" className="block text-sm font-medium mb-2">
              Select CSV File
            </label>
            <Input
              id="csv-import-input"
              type="file"
              accept=".csv"
              onChange={(e) => setImportFile(e.target.files?.[0] || null)}
              disabled={isImporting}
            />
          </div>
          <Button
            type="button"
            onClick={handleImportCSV}
            disabled={!importFile || isImporting}
            className="flex items-center gap-2"
          >
            {isImporting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Importing...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4" />
                Import CSV
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Add/Edit Form */}
      <div id="donation-form" className="bg-card border border-border rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-4">
          {editingId ? "Edit Donation" : "Add New Donation"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="donor_name" className="block text-sm font-medium mb-2">
                Donor Name <span className="text-destructive">*</span>
              </label>
              <Input
                id="donor_name"
                value={formData.donor_name}
                onChange={(e) => setFormData({ ...formData, donor_name: e.target.value })}
                required
                placeholder="John Doe"
              />
            </div>

            <div>
              <label htmlFor="amount" className="block text-sm font-medium mb-2">
                Amount ($) <span className="text-destructive">*</span>
              </label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                required
                placeholder="50.00"
              />
            </div>

            <div>
              <label htmlFor="payment_method" className="block text-sm font-medium mb-2">
                Payment Method
              </label>
              <Input
                id="payment_method"
                value={formData.payment_method}
                onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
                placeholder="PayPal, Zelle, Cash, Check, etc."
              />
            </div>

            <div>
              <label htmlFor="transaction_date" className="block text-sm font-medium mb-2">
                Transaction Date
              </label>
              <Input
                id="transaction_date"
                type="date"
                value={formData.transaction_date}
                onChange={(e) => setFormData({ ...formData, transaction_date: e.target.value })}
              />
            </div>

            <div>
              <label htmlFor="order_description" className="block text-sm font-medium mb-2">
                Order Description
              </label>
              <Input
                id="order_description"
                value={formData.order_description}
                onChange={(e) =>
                  setFormData({ ...formData, order_description: e.target.value })
                }
                placeholder="e.g., 10 pictures (digital)"
              />
            </div>

            <div>
              <label htmlFor="photoshoot_type" className="block text-sm font-medium mb-2">
                Photoshoot Type
              </label>
              <Input
                id="photoshoot_type"
                value={formData.photoshoot_type}
                onChange={(e) => setFormData({ ...formData, photoshoot_type: e.target.value })}
                placeholder="e.g., Graduation Photo"
              />
            </div>
          </div>

          <div>
            <label htmlFor="note" className="block text-sm font-medium mb-2">
              Note/Message
            </label>
            <Textarea
              id="note"
              value={formData.note}
              onChange={(e) => setFormData({ ...formData, note: e.target.value })}
              placeholder="Optional message from donor"
              rows={3}
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is_donation"
              checked={formData.is_donation}
              onChange={(e) => setFormData({ ...formData, is_donation: e.target.checked })}
              className="h-4 w-4 rounded border-border"
            />
            <label htmlFor="is_donation" className="text-sm font-medium">
              This is a donation (counts toward total)
            </label>
          </div>

          <div className="flex gap-3">
            <Button type="submit" disabled={isSubmitting} className="flex-1">
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {editingId ? "Updating..." : "Adding..."}
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  {editingId ? "Update Donation" : "Add Donation"}
                </>
              )}
            </Button>
            {editingId && (
              <Button
                type="button"
                variant="outline"
                onClick={resetForm}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
            )}
          </div>
        </form>
      </div>

      {/* Donations List */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-4">All Donations</h2>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : donations.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">No donations yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-2 text-sm font-medium">Donor</th>
                  <th className="text-left p-2 text-sm font-medium">Amount</th>
                  <th className="text-left p-2 text-sm font-medium">Date</th>
                  <th className="text-left p-2 text-sm font-medium">Payment</th>
                  <th className="text-left p-2 text-sm font-medium">Note</th>
                  <th className="text-right p-2 text-sm font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {donations.map((donation) => (
                  <tr key={donation.id} className="border-b border-border/50 hover:bg-muted/30">
                    <td className="p-2 text-sm">
                      <div className="font-medium">{donation.donor_name}</div>
                      {donation.order_description && (
                        <div className="text-xs text-muted-foreground">
                          {donation.order_description}
                        </div>
                      )}
                    </td>
                    <td className="p-2 text-sm font-medium">
                      ${Math.round(donation.amount * 100) / 100}
                      {!donation.is_donation && (
                        <span className="text-xs text-muted-foreground ml-1">(order)</span>
                      )}
                    </td>
                    <td className="p-2 text-sm text-muted-foreground">
                      {donation.transaction_date
                        ? new Date(donation.transaction_date).toLocaleDateString()
                        : new Date(donation.created_at).toLocaleDateString()}
                    </td>
                    <td className="p-2 text-sm text-muted-foreground">
                      {donation.payment_method || "-"}
                    </td>
                    <td className="p-2 text-sm text-muted-foreground">
                      {donation.note ? (
                        <div className="max-w-xs truncate" title={donation.note}>
                          {donation.note}
                        </div>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="p-2">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(donation)}
                          className="h-8 w-8 p-0"
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(donation.id)}
                          className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

