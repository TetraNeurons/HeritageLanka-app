import { db } from "@/db/drizzle";
import { advertisements } from "@/db/schema";
import { eq, sql } from "drizzle-orm";

export type AdStatus = "PENDING" | "ACTIVE" | "INACTIVE" | "REJECTED";

export interface Advertisement {
  id: string;
  imageUrl: string;
  description: string;
  redirectUrl: string;
  paymentReference: string;
  status: AdStatus;
  viewCount: number;
  submittedAt: Date;
  updatedAt: Date;
  approvedAt: Date | null;
  approvedBy: string | null;
}

// Generate unique payment reference
export function generatePaymentReference(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `AD-${timestamp}-${random}`;
}

// Insert new advertisement
export async function createAdvertisement(data: {
  imageUrl: string;
  description: string;
  redirectUrl: string;
}): Promise<Advertisement> {
  const paymentReference = generatePaymentReference();
  
  const [ad] = await db
    .insert(advertisements)
    .values({
      imageUrl: data.imageUrl,
      description: data.description,
      redirectUrl: data.redirectUrl,
      paymentReference,
      status: "PENDING",
    })
    .returning();

  return ad as Advertisement;
}

// Get advertisement by ID
export async function getAdvertisementById(id: string): Promise<Advertisement | null> {
  const [ad] = await db
    .select()
    .from(advertisements)
    .where(eq(advertisements.id, id));

  return ad ? (ad as Advertisement) : null;
}

// Get advertisement by payment reference
export async function getAdvertisementByReference(
  paymentReference: string
): Promise<Advertisement | null> {
  const [ad] = await db
    .select()
    .from(advertisements)
    .where(eq(advertisements.paymentReference, paymentReference));

  return ad ? (ad as Advertisement) : null;
}

// Get all advertisements with optional status filter
export async function getAllAdvertisements(
  statusFilter?: AdStatus
): Promise<Advertisement[]> {
  if (statusFilter) {
    const ads = await db
      .select()
      .from(advertisements)
      .where(eq(advertisements.status, statusFilter))
      .orderBy(sql`${advertisements.submittedAt} DESC`);
    
    return ads as Advertisement[];
  }

  const ads = await db
    .select()
    .from(advertisements)
    .orderBy(sql`${advertisements.submittedAt} DESC`);

  return ads as Advertisement[];
}

// Update advertisement status
export async function updateAdvertisementStatus(
  id: string,
  status: AdStatus,
  approvedBy?: string
): Promise<Advertisement | null> {
  const updateData: any = {
    status,
    updatedAt: new Date(),
  };

  if (status === "ACTIVE" && approvedBy) {
    updateData.approvedAt = new Date();
    updateData.approvedBy = approvedBy;
  }

  const [ad] = await db
    .update(advertisements)
    .set(updateData)
    .where(eq(advertisements.id, id))
    .returning();

  return ad ? (ad as Advertisement) : null;
}

// Increment view count
export async function incrementViewCount(id: string): Promise<void> {
  await db
    .update(advertisements)
    .set({
      viewCount: sql`${advertisements.viewCount} + 1`,
    })
    .where(eq(advertisements.id, id));
}

// Delete advertisement
export async function deleteAdvertisement(id: string): Promise<boolean> {
  const result = await db
    .delete(advertisements)
    .where(eq(advertisements.id, id))
    .returning();

  return result.length > 0;
}

// Get analytics
export async function getAdvertisementAnalytics() {
  const allAds = await db.select().from(advertisements);

  const totalAds = allAds.length;
  const activeAds = allAds.filter((ad) => ad.status === "ACTIVE").length;
  const pendingAds = allAds.filter((ad) => ad.status === "PENDING").length;
  const totalViews = allAds.reduce((sum, ad) => sum + (ad.viewCount || 0), 0);

  // Calculate revenue estimate (50 LKR per day per active ad)
  // For simplicity, we'll estimate based on days since approval
  let revenueEstimate = 0;
  const now = new Date();
  
  allAds.forEach((ad) => {
    if (ad.status === "ACTIVE" && ad.approvedAt) {
      const daysSinceApproval = Math.floor(
        (now.getTime() - new Date(ad.approvedAt).getTime()) / (1000 * 60 * 60 * 24)
      );
      revenueEstimate += Math.max(1, daysSinceApproval) * 50;
    }
  });

  return {
    totalAds,
    activeAds,
    pendingAds,
    totalViews,
    revenueEstimate,
  };
}

// Get random active advertisement
export async function getRandomActiveAdvertisement(): Promise<Advertisement | null> {
  const activeAds = await db
    .select()
    .from(advertisements)
    .where(eq(advertisements.status, "ACTIVE"));

  if (activeAds.length === 0) {
    return null;
  }

  const randomIndex = Math.floor(Math.random() * activeAds.length);
  return activeAds[randomIndex] as Advertisement;
}
