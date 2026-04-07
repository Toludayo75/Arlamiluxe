import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { ShippingRate } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminShipping() {
  const { toast } = useToast();
  const [newState, setNewState] = useState("");
  const [newFee, setNewFee] = useState("");
  const [editedFees, setEditedFees] = useState<Record<string, string>>({});

  const { data: rates, isLoading } = useQuery<ShippingRate[]>({
    queryKey: ["/api/admin/shipping-rates"],
  });

  const createRateMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/admin/shipping-rates", {
        state: newState.trim(),
        fee: Number(newFee),
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/shipping-rates"] });
      setNewState("");
      setNewFee("");
      toast({ title: "Shipping rate created", description: "New shipping rate has been added." });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create shipping rate", variant: "destructive" });
    },
  });

  const updateRateMutation = useMutation({
    mutationFn: async ({ id, fee }: { id: string; fee: number }) => {
      const response = await apiRequest("PATCH", `/api/admin/shipping-rates/${id}`, { fee });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/shipping-rates"] });
      toast({ title: "Updated", description: "Shipping rate updated successfully." });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update shipping rate", variant: "destructive" });
    },
  });

  const handleCreateRate = async () => {
    if (!newState.trim() || !newFee.trim() || Number.isNaN(Number(newFee)) || Number(newFee) < 0) {
      toast({ title: "Invalid input", description: "Please enter a valid state and fee.", variant: "destructive" });
      return;
    }
    createRateMutation.mutate();
  };

  const handleUpdateRate = (rate: ShippingRate) => {
    const feeValue = editedFees[rate.id];
    if (feeValue === undefined) return;
    const fee = Number(feeValue);
    if (Number.isNaN(fee) || fee < 0) {
      toast({ title: "Invalid fee", description: "Fee must be a valid number.", variant: "destructive" });
      return;
    }
    updateRateMutation.mutate({ id: rate.id, fee });
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-serif font-semibold mb-2" data-testid="text-shipping-title">Shipping Rates</h1>
        <p className="text-muted-foreground">Manage state-based delivery fees.</p>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Add Shipping Rate</CardTitle>
          <CardDescription>Define the delivery fee for a Nigerian state.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <div>
            <Label htmlFor="new-state">State</Label>
            <Input
              id="new-state"
              value={newState}
              onChange={(event) => setNewState(event.target.value)}
              placeholder="Lagos"
            />
          </div>
          <div>
            <Label htmlFor="new-fee">Fee (₦)</Label>
            <Input
              id="new-fee"
              type="number"
              value={newFee}
              onChange={(event) => setNewFee(event.target.value)}
              placeholder="2500"
            />
          </div>
          <div className="flex items-end">
            <Button onClick={handleCreateRate} disabled={createRateMutation.status === "pending"}>
              {createRateMutation.status === "pending" ? "Saving..." : "Create Rate"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Existing Shipping Rates</CardTitle>
          <CardDescription>Update any state delivery fee at any time.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : rates && rates.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>State</TableHead>
                  <TableHead>Fee</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rates.map((rate) => (
                  <TableRow key={rate.id}>
                    <TableCell>{rate.state}</TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        value={editedFees[rate.id] ?? rate.fee.toString()}
                        onChange={(event) =>
                          setEditedFees((prev) => ({ ...prev, [rate.id]: event.target.value }))
                        }
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        onClick={() => handleUpdateRate(rate)}
                        disabled={updateRateMutation.status === "pending"}
                      >
                        Save
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No shipping rates configured yet.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
