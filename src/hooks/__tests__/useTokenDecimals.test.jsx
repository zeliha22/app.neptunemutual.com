import { useTokenDecimals } from "@/src/hooks/useTokenDecimals";
import { mockFn, renderHookWrapper } from "@/utils/unit-tests/test-mockup-fn";
import { testData } from "@/utils/unit-tests/test-data";

describe("useTokenDecimals", () => {
  mockFn.utilsWeb3.getProviderOrSigner();
  mockFn.useTxPoster();

  test("while fetching w/o networkId, tokenAddress and account ", async () => {
    mockFn.useWeb3React(() => ({ account: null }));
    mockFn.useNetwork(() => ({ networkId: null }));

    const mockProps = {
      tokenAddress: "",
    };

    const { result } = await renderHookWrapper(useTokenDecimals, [
      mockProps.tokenAddress,
    ]);

    expect(result).toEqual(18);
  });

  test("while fetching w/o instance", async () => {
    mockFn.useWeb3React();
    mockFn.useNetwork();
    mockFn.sdk.registry.IERC20.getInstance(true);

    const mockProps = {
      tokenAddress: "",
    };

    await renderHookWrapper(useTokenDecimals, [mockProps.tokenAddress]);
  });

  test("while fetching w/ networkId, tokenAddress and account", async () => {
    mockFn.useWeb3React();
    mockFn.useNetwork();
    mockFn.useTxPoster(() => ({
      ...testData.txPoster,
      writeContract: (arg) => {
        arg?.onTransactionResult?.();
        arg?.onRetryCancel?.();
        arg?.onError?.();

        return 18;
      },
    }));
    mockFn.sdk.registry.IERC20.getInstance();

    const mockProps = {
      tokenAddress: "0x98e7786ffF366AEff1A55131C92C4Aa7EDd68aD1",
    };

    const { result } = await renderHookWrapper(useTokenDecimals, [
      mockProps.tokenAddress,
    ]);

    expect(result).toEqual(18);
  });
});