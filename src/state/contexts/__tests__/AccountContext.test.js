import { renderHook, act } from '@testing-library/react-hooks';
import AccountProvider from '../AccountContext';



describe('<AccountProvider />', () => {
  let result;

  beforeEach(() => {
    ({ result } = renderHook(() => AccountProvider({})));
  })



  test('it has correct initial state', () => {
    // globale variables
    expect(result.current.props.value.globalAccount).toBe('');
    expect(result.current.props.value.globalActive).toBe(false);
    expect(result.current.props.value.globalChainId).toBe(0);
  });

  test('successfully updates state', () => {
    act(() => {
      result.current.props.value.setGlobalAccount("test account")
      result.current.props.value.setGlobalActive(true)
      result.current.props.value.setGlobalChainId(12345)
    });

    expect(result.current.props.value.globalAccount).toBe("test account");
    expect(result.current.props.value.globalActive).toBe(true);
    expect(result.current.props.value.globalChainId).toBe(12345);
  });
});