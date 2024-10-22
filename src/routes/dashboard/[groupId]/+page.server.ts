import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	

	
	return {groupId: params.groupId};
	

	error(404, 'Not found');
};