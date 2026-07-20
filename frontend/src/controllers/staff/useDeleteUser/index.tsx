export function useDeleteUser() {
    const deleteUser = (userId: string) => new Promise<Fetch2Response>((resolve, reject) => window.fetch2.delete(`/api/staff/users/${userId}`, {})
        .then((res: Fetch2Response) => resolve(res))
        .catch(reject));

    return { deleteUser };
}
