import React from 'react';
import { render, act } from 'react-testing-library';

import { Query } from '../../../../src/components/query/Query';
import { Action, QueryResponse } from '../../../../src/client/client.types';
import { ClientContextProvider } from '../../../../src/context/clientContextProvider';

describe('Query test', () => {
  const action: Action = {
    method: 'GET',
    endpoint: 'foo',
  };

  const fetchFunction: () => Promise<QueryResponse> = jest.fn(async () => {
    await new Promise(res => setTimeout(res, 1000));

    return {
      error: false,
      status: 200,
      payload: {
        foo: 'bar',
      },
    };
  });

  const client = {
    query: fetchFunction,
  };

  const wrapper = ({ children }: any) => <ClientContextProvider client={client}>{children}</ClientContextProvider>;

  it('returns QueryResponse object to children', async () => {
    jest.useFakeTimers();

    const children = jest.fn(({ loading }) => (loading ? 'loading' : 'loaded'));

    const { unmount } = render(<Query action={action}>{children}</Query>, {
      wrapper: wrapper,
    });

    expect(children).toHaveBeenCalledWith(
      expect.objectContaining({ error: false, loading: true, query: expect.any(Function) }),
    );

    act(() => {
      jest.runAllTimers();
    });

    expect(fetchFunction).toHaveBeenCalledTimes(1);

    expect(children).lastCalledWith(
      expect.objectContaining({
        error: false,
        payload: { foo: 'bar' },
        status: 200,
        loading: false,
        query: expect.any(Function),
      }),
    );

    unmount();
  });
});
