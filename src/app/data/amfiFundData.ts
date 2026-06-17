import type { PolicyEntity } from "../types/policy";
import amfiFunds from "./amfiFundData.json";

// Generated from official AMFI NAVAll.txt downloaded from https://portal.amfiindia.com/spages/NAVAll.txt on 2026-06-10.
export const amfiFundMasterData = amfiFunds as PolicyEntity[];
