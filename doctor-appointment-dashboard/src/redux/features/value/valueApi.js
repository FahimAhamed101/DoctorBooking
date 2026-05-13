import { baseApi } from "../../baseApi/baseApi";

const valueApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    addValue: builder.mutation({
      query: (valueData) => ({
        url: "/values",
        method: "POST",
        body: valueData,
       
      }),
      invalidatesTags: ["Values"],
    }),
    getValues: builder.query({
      query: () => "/values",
      headers: {
          'Content-Type': 'application/json'
        },
      providesTags: ["Values"],
    }),
    getValueById: builder.query({
      query: (id) => ({
        url: `/values/${id}`,
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      }),
      transformResponse: (response) => response.data.attributes,
      providesTags: (result, error, id) => [{ type: 'Values', id }],
    }),
    updateValue: builder.mutation({
      query: ({ id, data }) => ({
        url: `/values/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["Values"],
    }),
    deleteValue: builder.mutation({
      query: (id) => ({
        url: `/values/${id}`,
        method: "DELETE",
        headers: {
          'Content-Type': 'application/json'
        }
      }),
      invalidatesTags: ["Values"],
    }),
  }),
});

export const {
  useAddValueMutation,
  useGetValuesQuery,
  useGetValueByIdQuery,
  useUpdateValueMutation,
  useDeleteValueMutation,
} = valueApi;