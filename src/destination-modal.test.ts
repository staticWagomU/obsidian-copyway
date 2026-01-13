import { describe, it, expect } from "vitest";
import { DestinationModal } from "./destination-modal";
import type { CopyDestination } from "./types";

describe("DestinationModal", () => {
	describe("基本構造", () => {
		it("Modalクラスを継承している", () => {
			const destinations: CopyDestination[] = [
				{ path: "/path/to/dest1", description: "Destination 1", overwrite: false },
			];
			const onSelect = () => {};
			const modal = new DestinationModal({} as any, destinations, onSelect);
			
			expect(modal).toBeDefined();
			expect(modal.open).toBeDefined();
			expect(modal.close).toBeDefined();
		});

		it("destinationsとonSelectコールバックを受け取る", () => {
			const destinations: CopyDestination[] = [
				{ path: "/path/to/dest1", description: "Destination 1", overwrite: false },
				{ path: "/path/to/dest2", description: "Destination 2", overwrite: true },
			];
			let selectedDestination: CopyDestination | null = null;
			const onSelect = (dest: CopyDestination) => {
				selectedDestination = dest;
			};
			
			const modal = new DestinationModal({} as any, destinations, onSelect);
			
			expect(modal).toBeDefined();
		});
	});
});
